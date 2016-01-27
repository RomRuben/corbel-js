'use strict';

var corbel = require('../../../dist/corbel.js'),
  chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon');

describe('corbel-js node', function() {

  var sandbox;

  this.timeout(20000);

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('corbel-js contains all modules', function() {
    expect(corbel).to.include.keys('request');
  });

  describe('request module', function() {

    var url = 'http://localhost:3000/',
      request;

    before(function() {
      request = corbel.request;
    });

    it('should has own properties', function() {
      expect(request).to.include.keys('method');
      expect(request.method).to.include.keys('GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD');
    });

    it('expected methods are available', function() {
      expect(request).to.respondTo('send');
    });

    ['GET', 'POST', 'PATCH', 'PUT', 'HEAD'].forEach(function(verb) {
      it('send method accepts http ' + verb + ' verb', function(done) {

        var promise = request.send({
          method: verb,
          url: url
        });

        expect(promise).to.be.fulfilled.and.should.notify(done);

      });
    });

    it('send method throws an error if no url setting', function() {

      var fn = function() {
        return request.send({
          method: 'GET'
        });
      };

      expect(fn).to.throw('undefined:url');
    });

    it('send mehtod returns a promise', function() {

      var promise = request.send({
        method: 'GET',
        url: url
      });

      expect(promise).to.be.instanceof(Promise);
    });

    it('send mehtod returns a promise and it resolves', function(done) {
      expect(request.send({
        method: 'GET',
        url: url
      }))
      .to.be.fulfilled.and.should.notify(done);
    });

    it('send mehtod returns a promise and reject it', function(done) {
      var promise = request.send({
        method: 'GET',
        url: url + '404'
      });

      expect(promise).to.be.rejected
      .then(function(error) {
        expect(error.status).to.be.equal(404);
      })
      .should.notify(done);

    });

    it('send mehtod accepts a success callback', function(done) {
      request.send({
        method: 'GET',
        url: url,
        success: function() {
          done();
        },
        error: function(error) {
          done(error);
        },
      });
    });

    it('success callback expect responseText, status , incoming message object', function(done) {
      request.send({
        method: 'GET',
        url: url,
        success: function(data, status, httpResponse) {
          expect(data).to.be.a('object');
          expect(status).to.be.a('number');
          expect(httpResponse).to.be.an('object');
          done();
        }
      });
    });

    it('send mehtod accepts an error callback', function(done) {
      request.send({
        method: 'GET',
        url: url + '404',
        error: function(data, status) {
          expect(status).to.be.equal(404);
          done();
        }
      });
    });

    it('send method sends a String as application/octet-stream', function(done) {
        var _nodeAjaxStub = sandbox.stub(request, '_nodeAjax', function(params, resolver) {
          resolver.resolve();
        });
        var testText = 'Test';
      
        request.send({
          method: 'POST',
          url: url,
          contentType : 'application/octet-stream',
          data: testText
        })
        .should.be.eventually.fulfilled
        .then(function() {
            expect(typeof(_nodeAjaxStub.getCall(0).args[0].data)).to.be.equal('string');
        })
        .should.notify(done);
    });
   
    it('send method sends a byteArray as application/octet-stream', function(done) {
        var _nodeAjaxStub = sandbox.stub(request, '_nodeAjax', function(params, resolver) {
          resolver.resolve();
        });
        var testText = 'Test';
        var byteText = [];
        for(var i = 0; i < testText.length; i++){
          byteText.push(testText.charCodeAt(i));
        }
      
        request.send({
          method: 'POST',
          url: url,
          contentType : 'application/octet-stream',
          data: byteText
        })
        .should.be.eventually.fulfilled
        .then(function() {
            var dataSended = _nodeAjaxStub.getCall(0).args[0].data;

            byteText.forEach(function(element, index) {
              expect(dataSended[index]).to.be.equal(element);
            });
            expect(typeof(_nodeAjaxStub.getCall(0).args[0].data)).to.be.equal('object');
        })
        .should.notify(done);
    });

    it('send method sends an Uint8Array as application/octet-stream', function(done) {
        var _nodeAjaxStub = sandbox.stub(request, '_nodeAjax', function(params, resolver) {
          resolver.resolve();
        });
        var testText = 'Test';
        var ui8arr = new Uint8Array(testText.length);
        for(var i = 0; i < testText.length; i++){
          ui8arr[i] = testText.charCodeAt(i);
        }
      
        request.send({
          method: 'POST',
          url: url,
          contentType : 'application/octet-stream',
          data: ui8arr
        })
        .should.be.eventually.fulfilled
        .then(function() {
            var dataSended = _nodeAjaxStub.getCall(0).args[0].data;
            for(var key in dataSended ) {
              if (dataSended.hasOwnProperty(key)) {
                expect(dataSended[key]).to.be.equal(ui8arr[key]);
              }
            }
            expect(typeof(_nodeAjaxStub.getCall(0).args[0].data)).to.be.equal('object');
        })
        .should.notify(done);
    });

    it('send method throws an error if try to send an ArrayBuffer as application/octet-stream', function() {
        var testText = 'Test';
        var buffer = new ArrayBuffer(testText.length);
        
        expect(function() {
            request.send({
              method: 'POST',
              url: url,
              contentType : 'application/octet-stream',
              data: buffer
            });
        }).to.throw('data sended must be a File, a Blob, or an ArrayBufferView'); 
    });

    it('send method throws an error if try to send an ArrayBuffer as application/blob', function() {
        var testText = 'Test';
        var buffer = new ArrayBuffer(testText.length);
        
        expect(function() {
            request.send({
              method: 'POST',
              url: url,
              contentType : 'application/blob',
              data: buffer
            });
        }).to.throw('data sended must be a Blob, not an ArrayBuffer'); 
    });

  });

});
