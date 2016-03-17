import Ember from 'ember';
import coughDropExtras from '../utils/extras';
import app_state from '../utils/app_state';
import modal from '../utils/modal';
import capabilities from '../utils/capabilities';
import i18n from '../utils/i18n';

export default Ember.Component.extend({
  tagName: 'span',
  didInsertElement: function() {
    this.check_native_shares();
  },
  check_native_shares: function() {
    var _this = this;
    _this.set('native', {});
    capabilities.sharing.available().then(function(list) {
      if(list.indexOf('facebook') != -1) { _this.set('native.facebook', true); }
      if(list.indexOf('twitter') != -1) { _this.set('native.twitter', true); }
      if(list.indexOf('instagram') != -1) { _this.set('native.instagram', true); }
      if(list.indexOf('google_plus') != -1) { _this.set('native.google_plus', true); }
      if(list.indexOf('email') != -1) { _this.set('native.email', true); }
      if(list.indexOf('clipboard') != -1) { _this.set('native.clipboard', true); }
      if(list.indexOf('generic') != -1) { _this.get('native.generic', true); }
    });
  },
  facebook_enabled: function() {
    return !!this.get('url');
  }.property('url'),
  twitter_enabled: function() {
    return !!this.get('url');
  }.property('url'),
  google_plus_enabled: function() {
    return !!this.get('url');
  }.property('url'),
  email_enabled: function() {
    return !!this.get('text');
  }.property('text'),
  instagram_enabled: function() {
    return !!(this.get('url') && this.get('native.instagram'));
  }.property('url', 'native.instagram'),
  clipboard_enabled: function() {
    if(document.queryCommandSupported && document.queryCommandSupported('copy')) {
      return true;
    } else {
      return !!this.get('native.clipboard');
    }
  }.property('native.clipboard'),
  generic_enabled: function() {
    return !!this.get('native.generic');
  }.property('native.generic'),
  facebook_url: function() {
    return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(this.get('url'));
  }.property('url'),
  twitter_url: function() {
    return 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(this.get('url')) + '&text=' + encodeURIComponent(this.get('text')) + '&related=CoughDropAAC';
  }.property('url', 'text'),
  google_plus_url: function() {
    return 'https://plus.google.com/share?url=' + encodeURIComponent(this.get('url'));
  }.property('url'),
  actions: {
    message: function(supervisor) {
      modal.open('confirm-notify-user', {user: supervisor, utterance: this.get('utterance')});
    },
    share_via: function(medium) {
      if(this.get('native.' + medium)) {
        capabilities.sharing.share(medium, this.get('text'), this.get('url'));
      } else if(medium == 'facebook') {
        window.open(this.get('facebook_url'));
      } else if(medium == 'twitter') {
        window.open(this.get('twitter_url'));
      } else if(medium == 'google_plus') {
        window.open(this.get('google_plus_url'));
      } else if(medium == 'email') {
        modal.open('share-email', {url: this.get('url'), text: this.get('text'), utterance_id: this.get('utterance.id') });
      } else if(medium == 'clipboard' && this.get('clipboard_enabled')) {
        var $elem = Ember.$("#" + this.get('element_id'));
        window.getSelection().removeAllRanges();
        if($elem[0].tagName == 'INPUT') {
          $elem.focus().select();
        } else {
          var range = document.createRange();
          range.selectNode($elem[0]);
          window.getSelection().addRange(range);
        }
        var res = document.execCommand('copy');
        window.getSelection().removeAllRanges();
        this.sendAction('copy_event', !!res);
      }
    }
  }
});