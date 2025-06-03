const { ActivityStream, Properties } = require('../../core/activitystreams2');
const { AnnounceEndorsementFixtureFactory } = require('../fixtures/announce_endorsement');

describe('TestActivitystreams', () => {
  test('01 construction', () => {
    let as2 = new ActivityStream();
    expect(as2.doc).toEqual({});
    expect(as2.context).toEqual([]);

    const source = AnnounceEndorsementFixtureFactory.source();
    const s2 = JSON.parse(JSON.stringify(source)); // deep copy
    const s2context = s2['@context'];
    delete s2['@context'];

    as2 = new ActivityStream(source);

    expect(as2.doc).toEqual(s2);
    expect(as2.context).toEqual(s2context);
  });

  test('02 set properties', () => {
    const as2 = new ActivityStream();

    // properties that are just basic json
    as2.set_property('random', 'value');
    expect(as2.doc['random']).toBe('value');
    expect(as2.context).toEqual([]);

    // properties that are in the ASProperties
    as2.set_property(Properties.ID, 'value');
    expect(as2.doc['id']).toBe('value');
    expect(as2.context).toEqual([Properties.ID[1]]);

    as2.set_property(Properties.TYPE, 'another');
    expect(as2.doc['type']).toBe('another');
    expect(as2.context).toEqual([Properties.ID[1]]);

    // other variations on property namespaces
    as2.set_property(['object', 'http://example.com'], 'object value');
    as2.set_property(['subject', 'http://example.com'], 'subject value');
    expect(as2.doc['object']).toBe('object value');
    expect(as2.doc['subject']).toBe('subject value');
    expect(as2.context).toEqual([Properties.ID[1], 'http://example.com']);

    as2.set_property(['foaf:name', ['foaf', 'http://xmlns.com/foaf/0.1']], 'name value');
    as2.set_property(['foaf:email', ['foaf', 'http://xmlns.com/foaf/0.1']], 'email value');
    expect(as2.doc['foaf:name']).toBe('name value');
    expect(as2.doc['foaf:email']).toBe('email value');
    expect(as2.context).toEqual([Properties.ID[1], 'http://example.com', { foaf: 'http://xmlns.com/foaf/0.1' }]);
  });

  test('03 get properties', () => {
    const as2 = new ActivityStream();
    as2.set_property('random', 'value');
    as2.set_property(Properties.ID, 'id');
    as2.set_property(['object', 'http://example.com'], 'object value');
    as2.set_property(['foaf:name', ['foaf', 'http://xmlns.com/foaf/0.1']], 'name value');

    expect(as2.get_property('random')).toBe('value');
    expect(as2.get_property(Properties.ID)).toBe('id');
    expect(as2.get_property(['object', 'http://example.com'])).toBe('object value');
    expect(as2.get_property('object')).toBe('object value');
    expect(as2.get_property(['foaf:name', ['foaf', 'http://xmlns.com/foaf/0.1']])).toBe('name value');
    expect(as2.get_property('foaf:name')).toBe('name value');
  });

  test('04 to jsonld', () => {
    // check we can round trip a document
    const source = AnnounceEndorsementFixtureFactory.source();
    const s2 = JSON.parse(JSON.stringify(source)); // deep copy
    const as2 = new ActivityStream(source);
    expect(as2.to_jsonld()).toEqual(s2);

    // check we can build a document from scratch and get an expected result
    const as2b = new ActivityStream();
    as2b.set_property('random', 'value');
    as2b.set_property(Properties.ID, 'id');
    as2b.set_property(['object', 'http://example.com'], 'object value');
    as2b.set_property(['foaf:name', ['foaf', 'http://xmlns.com/foaf/0.1']], 'name value');

    const expected = {
      '@context': [Properties.ID[1], 'http://example.com', { foaf: 'http://xmlns.com/foaf/0.1' }],
      random: 'value',
      id: 'id',
      object: 'object value',
      'foaf:name': 'name value',
    };

    expect(as2b.to_jsonld()).toEqual(expected);
  });
});
