import { observable, action, computed } from 'mobx';

import { firebase, auth } from 'libs';

import client from 'data/client';
import {User} from 'data/models/User'
import { IUserCreationInfo } from 'common';

export class AuthStore {
    /**
     * Gets the auth UI configuration.
     */
    public uiConfig: any;

    public readonly maxDisplayNameLength = 50;

    /**
     * Gets whether auth store is initializing.
     */
    @observable
    public initializing: boolean = true;

    /**
     * Gets whether auth store is syncing with API.
     */
    @observable
    public syncing: boolean = false;

    /**
     * Gets whether this is a new user sign up.
     */
    @observable
    public newUser: boolean = false;

    /**
     * Gets the user's profile.
     */
    @observable
    public userProfile: User | null;

    /**
     * Gets the user's profile.
     */
    @observable
    public firebaseUser: firebase.User | null;

    /**
     * Gets whether to display the login.
     */
    @observable
    public displayLogin: boolean = false;

    /**
     * Gets whether the user is logged in or not
     */
    @computed
    public get isLoggedIn() : boolean{
        return this.userProfile !== null;
    }

    /**
     * Gets whether the user is logged in or not
     */
    @computed
    public get isAuthenticatedWithFirebase() : boolean{
        return this.firebaseUser !== null;
    }

    constructor() {
        this.uiConfig = {
            signInFlow: 'popup',
            signInOptions: [
                firebase.auth.EmailAuthProvider.PROVIDER_ID,
                firebase.auth.GoogleAuthProvider.PROVIDER_ID
            ],
            callbacks: {
                signInSuccessWithAuthResult: () => false,
            },
        };

        auth.onAuthStateChanged(this.onAuthChanged);
    }

    //#region Public

    /**
     * Toggles the displayLogin property.
     */
    public toggleDisplayLogin = () => {
        this.setDisplayLogin(!this.displayLogin);
    }

    /**
     * Sets the displayLogin to true.
     */
    public login = () => {
        this.setDisplayLogin(true);
    }

    /**
     * Login using id token generated by server.
     */
    // public loginId = async (id: string) => {
    //     try {
    //         await auth.signInWithCustomToken(id);
    //     } catch (error) {
    //         // this.logger.error('loginId', error.message);
    //         console.log('Authentication ERROR', error);
    //     }
    // }

    /**
     * Logs user out of session.
     */
    public logout = () => {
        auth.signOut();
        this.setDisplayLogin(false);
    }

    //#endregion

    //#region Private

    //This method needs work, but this works for now! :)
    private onAuthChanged = async (firebaseUser: firebase.User) => {
        this.setFirebaseUser(firebaseUser);

        if(firebaseUser == null){
            this.setUserProfile(null);
            if(this.initializing) {
                this.setInitializing(false);
            }
            return;
        }
        
        let backendUser = await this.getExistingUser(firebaseUser.uid);
        if(backendUser !== null){
            this.setUserProfile(backendUser);
            this.setInitializing(false);
            return;
        }

        this.setNewUser(true);
    }

    public onFinalizeUserCreation = async (userCreationInfo: IUserCreationInfo) => {
        let backendUser = await this.createBackendUser(userCreationInfo);
        this.setNewUser(false);
        this.setUserProfile(backendUser);
        
        this.setInitializing(false);
    }

    private async createBackendUser(userCreationInfo: IUserCreationInfo): Promise<User>{
        if(this.firebaseUser === null){
            throw new Error('FirebaseUser required...')
        }
        let backendUser = User.initializeBackendUserFromFirebaseUser(this.firebaseUser);
        backendUser.DisplayName = userCreationInfo.preferredName;
        backendUser.Phone = userCreationInfo.phone;
        backendUser.Location = userCreationInfo.location;
        await client.users.createUser(backendUser);
        return backendUser;
    }

    private getExistingUser = async (userId: string) => {
        try {
            const existingUser = await client.users.getMe(userId);
            return existingUser;
        } catch (error) {
            return null;
        }
    }

    //#endregion

    //#region Actions

    @action
    private setUserProfile = (userProfile: User | null) => {
        console.log('setUserProfile', userProfile);
        this.userProfile = userProfile;
    }

    @action
    private setFirebaseUser = (firebaseUser: firebase.User | null) => {
        this.firebaseUser = firebaseUser;
    }

    @action
    private setDisplayLogin = (displayLogin: boolean) => {
        this.displayLogin = displayLogin;
    }

    @action
    private setInitializing = (initializing: boolean) => {
        this.initializing = initializing;
    }

    @action
    private setNewUser = (newUser: boolean) => {
        console.log('setNewUser', newUser);
        this.newUser = newUser;
    }

    //#endregion
}

export default new AuthStore();