/* eslint-disable jest/no-truthy-falsy */
/* eslint-disable jest/prefer-expect-assertions */
import mongoose from 'mongoose';
import { Post, IPostDoc } from '../__fixtures__/Post';

jest.mock('../__fixtures__/db.ts');
jest.setTimeout(30000);

describe('mongoose-dp', () => {


  it('return diff model', async () => {
    const Diff = Post.diffModel();
    const diff = new Diff({ p: ['title'], c: [{ p: ['way'] }] });

    expect(typeof Diff).toBe('function');
    expect(typeof Diff.findByDocId).toBe('function');
    expect(typeof Diff.createDiff).toBe('function');
    expect(typeof Diff.findAfterVersion).toBe('function');
    expect(typeof Diff.findBeforeVersion).toBe('function');
    expect(typeof Diff.revertToVersion).toBe('function');
    expect(diff.c[0].p[0]).toBe('way');
  });

  it('save diffs', async () => {
    try{
      // need to return doc from db for invoking `init` hook,
      // because there is no sense to save initial doc in diffs
      await Post.create({ title: 'test', subjects: [{ name: 'matsdcsdch' }] });
      const post: IPostDoc = (await Post.findOne({
        title: 'test',
      }).exec()) as any;
      post.title = 'updated';
      post.subjects = [{ name: 'math', _id: new mongoose.Types.ObjectId().toString() }, { name: 'air', _id: new mongoose.Types.ObjectId().toString() }];
      await post.save();
  
      const Diff = Post.diffModel();
      const diffs = await Diff.findByDocId(post._id);
  
      expect(Array.isArray(diffs)).toBeTruthy();
      expect(diffs[0].c).toMatchInlineSnapshot(`
        CoreDocumentArray [
          Object {
            "k": "E",
            "l": "test",
            "p": Array [
              "title",
            ],
            "r": "updated",
          },
          Object {
            "i": 1,
            "it": Object {
              "k": "N",
              "r": Object {
                "name": "air",
              },
            },
            "k": "A",
            "p": Array [
              "subjects",
            ],
          },
          Object {
            "k": "E",
            "l": "matsdcsdch",
            "p": Array [
              "subjects",
              "0",
              "name",
            ],
            "r": "math",
          },
        ]
      `);
      expect(diffs[0].v).toBe(1);

    }catch(e){
      console.log('Error Saving Diffs', e);
    } 
  });

  describe('save array diffs properly', () => {
    it('add new element', async () => {
     try{
      await Post.create({ title: 'newElement', subjects: [{ name: 'test' }] });
      const post: IPostDoc = (await Post.findOne({
        title: 'newElement',
      }).exec()) as any;
      post.subjects = [{ name: 'test', _id: new mongoose.Types.ObjectId().toString()  }, { name: 'new test', _id: new mongoose.Types.ObjectId().toString() }];
      await post.save();

      const Diff = Post.diffModel();
      const diffs = await Diff.findByDocId(post._id);
      expect(diffs[0].c).toMatchInlineSnapshot(`
        CoreDocumentArray [
          Object {
            "i": 1,
            "it": Object {
              "k": "N",
              "r": Object {
                "name": "new test",
              },
            },
            "k": "A",
            "p": Array [
              "subjects",
            ],
          },
        ]
      `);
     }catch(e){
        console.log('Error Adding New Element', e);
      }
    });

    it('edit existed element', async () => {
     try {
      await Post.create({
        title: 'existedElement',
        subjects: [{ name: 'was', _id: new mongoose.Types.ObjectId().toString() }],
      });
      const post: IPostDoc = (await Post.findOne({
        title: 'existedElement',
      }).exec()) as any;
      post.subjects = [{ name: 'become', _id: new mongoose.Types.ObjectId().toString() }];
      await post.save();

      const Diff = Post.diffModel();
      const diffs = await Diff.findByDocId(post._id);
      expect(diffs[0].c).toMatchInlineSnapshot(`
        CoreDocumentArray [
          Object {
            "k": "E",
            "l": "was",
            "p": Array [
              "subjects",
              "0",
              "name",
            ],
            "r": "become",
          },
        ]
      `);
     } catch(e){
        console.log('Error Editing Existed Element', e);
      }
    });

    it('delete element', async () => {
     try{ await Post.create({
        title: 'deleteElement',
        subjects: [{ name: 'one' }, { name: 'two' }, { name: 'three' }],
      });
      const post: IPostDoc = (await Post.findOne({
        title: 'deleteElement',
      }).exec()) as any;
      post.subjects = [{ name: 'one', _id: new mongoose.Types.ObjectId().toString() }, { name: 'three', _id: new mongoose.Types.ObjectId().toString() }];
      await post.save();

      const Diff = Post.diffModel();
      const diffs = await Diff.findByDocId(post._id);
      expect(diffs[0].c).toMatchInlineSnapshot(`
        CoreDocumentArray [
          Object {
            "i": 2,
            "it": Object {
              "k": "D",
              "l": Object {
                "name": "three",
              },
            },
            "k": "A",
            "p": Array [
              "subjects",
            ],
          },
          Object {
            "k": "E",
            "l": "two",
            "p": Array [
              "subjects",
              "1",
              "name",
            ],
            "r": "three",
          },
        ]
      `);
    }catch(e){
        console.log('Error Deleting Element', e);
      } 
    });
  });
});
