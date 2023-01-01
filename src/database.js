import { fetchGetJson, fetchPostJson } from './fetchFunc';

class Database {
  phpUrl = window.phpUrl;

  constructor(phpUrl) {
    if (phpUrl) this.phpUrl = phpUrl;

    this.actList = [];
    //  list of activities each activity is an object
    //  actid: 0,
    //  actdesc: '',
    //  actvoit: 0,
    this.actLoaded = null; // promise return actList
    this.groupList = [];
    //  list of groups each group is an object
    //  grpid: 0,
    //  grpdesc: '',
    //  grprespprenom: '',
    //  grpcode: '',
    //  grprespid: 0,
    //  grplevel
    //  grpdeputy
    this.groupsLoaded = null; // promise return groupList
    this.actSessionList = [];
    this.grpSessionList = [];
    this.planningLoaded = null; // promise return planningList
    this.sessionInscrits = {};
    this.sessionInscritsLoaded = null; // promise return list of inscrits
    this.usersLoaded = false;
  }
  // ============================================================================

  loadAct() {
    //   load list of all activities objects
    this.actLoaded = fetchGetJson(
      `${this.phpUrl}getactivite.php`,
      (listact) => {
        this.actList = [...listact];
        return listact;
      },
    );
    return this.actLoaded;
  }
  // ============================================================================

  loadGroups() {
    //   load list of all groups objects
    this.groupsLoaded = fetchGetJson(
      `${this.phpUrl}getgrp.php`,
      (listgrp) => {
        this.groupList = [...listgrp];
        return this.groupList;
      },
    );
    return this.groupsLoaded;
  }
  // ============================================================================

  loadActPlanning(actId, userId) {
    //   load list of all sessions for one activity
    const actPlanningLoaded = fetchGetJson(
      `${this.phpUrl}planning.php?act=${actId}&userid=${userId}`,
      (sess) => {
        this.actSessionList = [...sess];
        return sess;
      },
    );
    return actPlanningLoaded;
  }

  // ============================================================================

  loadGrpPlanning(grpId, userId) {
    //   load list of all sessions for one group
    const grpPlanningLoaded = fetchGetJson(
      `${this.phpUrl}planning.php?grp=${grpId}&userid=${userId}`,
      (sess) => {
        this.grpSessionList = [...sess];
        return sess;
      },
    );
    return grpPlanningLoaded;
  }

  // ============================================================================

  loadSessionInscrits(sessionid) {
    //   load list people for the session in parm
    this.sessionInscritsLoaded = fetchGetJson(
      `${this.phpUrl}getsessinscrits.php?session=${sessionid}`,
      (sessinscrits) => {
        this.sessionInscrits = { ...sessinscrits };
        return sessinscrits;
      },
    );
    return this.sessionInscritsLoaded;
  }
  // ============================================================================

  subscribe(userid, sessionid, voiture, message) {
    //   update database with subscription
    const subscribeDone = fetchGetJson(
      `${this.phpUrl}subscribe.php?usrid=${userid}&sessid=${sessionid}`
      + `&voiture=${voiture}&message=${message}`,
      (result) => result,
    );
    return subscribeDone;
  }
  // ============================================================================

  unsubscribe(userid, sessionid) {
    //   update database with subscription
    const subscribeDone = fetchGetJson(
      `${this.phpUrl}unsubscribe.php?usrid=${userid}&sessid=${sessionid}`,
      (result) => result,
    );
    return subscribeDone;
  }

  // ============================================================================

  async loadUsers() {
    //   reload Users table in sqlite if necessary
    if (!this.usersLoaded) {
      await fetchGetJson(
        `${this.phpUrl}loadusers.php`,
        (result) => {
          this.usersLoaded = result.status;
          if (!result.status) {
            throw new Error(result.message);
          }
          return this.usersLoaded;
        },
      );
    }
    return this.usersLoaded;
  }

  // ============================================================================

  setGrpCode(grpid, code) {
  //   update database with the new code
    const promGrpCode = fetchGetJson(
      `${this.phpUrl}newgrpcode.php?grpid=${grpid}&code=${code}`,
      (codeObj) => {
        //    change the code in the current group and in the grouplist
        for (const grp of this.groupList) {
          if (grp.grpid === grpid) {
            grp.grpcode = codeObj.code;
          }
        }
      },
    );
    return promGrpCode;
  }

  // ============================================================================

  crNewSession(usrid, newsessdata) {
    //   create a new session in  database
    const data = `usrid=${usrid}&grpid=${newsessdata.sessgrp}&sessdate=${newsessdata.sessdate}`
              + `&sesslieu=${newsessdata.sesslieu}&sessrdv=${newsessdata.sessrdv}`
              + `&sessinfo=${newsessdata.sessinfo}&sesslink=${newsessdata.sesslink}`;

    const promNewSess = fetchGetJson(
      `${this.phpUrl}newsession.php?${data}`,
      (newsess) => {
        //    if ok add session in the sessionList
        this.grpSessionList = [...this.grpSessionList, newsess];
        return newsess;
      },

    );
    return promNewSess;
  }

  // ============================================================================

  updateSession(usrid, sessdata) {
    //   update session in  database
    const data = `&sessid=${sessdata.sessid}`
              + `&sesslieu=${sessdata.sesslieu}&sessrdv=${sessdata.sessrdv}`
              + `&sessinfo=${sessdata.sessinfo}&sesslink=${sessdata.sesslink}`
              + `&sessdate=${sessdata.sessdate}`;

    const promNewSess = fetchGetJson(
      `${this.phpUrl}sessupdate.php?${data}`,
      (newsess) => {
        //    if ok update session in the sessionList
        this.grpSessionList = [...this.grpSessionList, newsess];
        return newsess;
      },

    );
    return promNewSess;
  }

  // ============================================================================

  deleteSession(sessid) {
    //   delete session in  database

    const promNewSess = fetchGetJson(
      `${this.phpUrl}sessdelete.php?sessid=${sessid}`,
      (result) => {
        //    if ok delete session in the sessionList
        const sessionList = this.grpSessionList.filter((sess) => sess.sessid !== sessid);
        this.grpSessionList = [...sessionList];
        return result;
      },
    );
    return promNewSess;
  }

  // ============================================================================

  sendMail(jsonobj) {
    //   ask php to send the mail
    const promSendMail = fetchPostJson(
      `${this.phpUrl}sendmail.php`,
      jsonobj,
    );
    return promSendMail;
  }

  // ============================================================================

  setDeputy(grpId, deputyList) {
    /*   update group with a new list of deputies
          find index of group in the list of groups
          update the group in the list with the new list of deputies
          update Database
          return the group updated
    */
    const idx = this.groupList.findIndex((grp) => grp.grpid === grpId);
    this.groupList[idx].grpdeputy = [...deputyList];
    fetchPostJson(
      `${this.phpUrl}setgrpdeputy.php`,
      { grpid: grpId, deputylist: deputyList },
      (status) => status,
    );
    return this.groupList[idx];
  }

  // ============================================================================

  getUserFfrs(ffrs) {
    /*
      get user by ffrs number
      return an object with a status and user object
      if status false then ffrs has not been found
    */
    return fetchGetJson(
      `${this.phpUrl}checkuserffrs.php?ffrs=${ffrs}`,
      (result) => result.user,
    );
  }
  // ============================================================================
}
export { Database };
