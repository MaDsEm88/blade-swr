import type { AddQuery, CountQuery, GetQuery, ListQuery, Model, RemoveQuery, SetQuery } from "@ronin/compiler";
import type { StoredObject } from "@ronin/compiler";
import type { DeepCallable, ResultRecord } from "@ronin/syntax/queries";
import type { PromiseTuple, QueryHandlerOptions } from "ronin/types";
type ResolveSchema<TSchema, TUsing extends Array<string> | "all", TKey extends string> = TUsing extends "all" ? TSchema : TKey extends TUsing[number] ? TSchema : TSchema extends Array<unknown> ? Array<string> : string;
declare module "ronin" {
    export type Account<TUsing extends Array<"userId"> | "all" = [
    ]> = ResultRecord & {
        accessToken: string;
        accessTokenExpiresAt: Date;
        accountId: string;
        idToken: string;
        password: string;
        providerId: string;
        refreshToken: string;
        refreshTokenExpiresAt: Date;
        scope: string;
        userId: ResolveSchema<User, TUsing, "userId">;
    };
    export type Accounts<TUsing extends Array<"userId"> | "all" = [
    ]> = Array<Account<TUsing>> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type Session<TUsing extends Array<"userId"> | "all" = [
    ]> = ResultRecord & {
        activeOrganizationId: string;
        expiresAt: Date;
        ipAddress: string;
        token: string;
        userAgent: string;
        userId: ResolveSchema<User, TUsing, "userId">;
    };
    export type Sessions<TUsing extends Array<"userId"> | "all" = [
    ]> = Array<Session<TUsing>> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type Verification = ResultRecord & {
        expiresAt: Date;
        identifier: string;
        value: string;
    };
    export type Verifications = Array<Verification> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type Teacher<TUsing extends Array<"userId"> | "all" = [
    ]> = ResultRecord & {
        bio: string;
        createdAt: Date;
        isIndependent: boolean;
        isVerified: boolean;
        updatedAt: Date;
        userId: ResolveSchema<User, TUsing, "userId">;
    };
    export type Teachers<TUsing extends Array<"userId"> | "all" = [
    ]> = Array<Teacher<TUsing>> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type School = ResultRecord & {
        address: string;
        createdAt: Date;
        district: string;
        domain: string;
        isActive: boolean;
        name: string;
        phone: string;
        placeId: string;
        studentCount: number;
        teacherCount: number;
        type: string;
        updatedAt: Date;
    };
    export type Schools = Array<School> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type Subject = ResultRecord & {
        code: string;
        createdAt: Date;
        description: string;
        isActive: boolean;
        name: string;
    };
    export type Subjects = Array<Subject> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type Class<TUsing extends Array<"teacherId" | "schoolId" | "subjectId"> | "all" = [
    ]> = ResultRecord & {
        createdAt: Date;
        currentEnrollment: number;
        description: string;
        endDate: Date;
        gradeLevel: string;
        isActive: boolean;
        maxCapacity: number;
        name: string;
        schoolId: ResolveSchema<School, TUsing, "schoolId">;
        startDate: Date;
        subjectId: ResolveSchema<Subject, TUsing, "subjectId">;
        teacherId: ResolveSchema<Teacher, TUsing, "teacherId">;
        updatedAt: Date;
    };
    export type Classes<TUsing extends Array<"teacherId" | "schoolId" | "subjectId"> | "all" = [
    ]> = Array<Class<TUsing>> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type Organization = ResultRecord & {
        createdAt: Date;
        logo: string;
        metadata: string;
        name: string;
        slug: string;
        updatedAt: Date;
    };
    export type Organizations = Array<Organization> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type Invitation<TUsing extends Array<"organizationId" | "inviterId"> | "all" = [
    ]> = ResultRecord & {
        createdAt: Date;
        email: string;
        expiresAt: Date;
        inviterId: ResolveSchema<User, TUsing, "inviterId">;
        organizationId: ResolveSchema<Organization, TUsing, "organizationId">;
        role: string;
        status: string;
        updatedAt: Date;
    };
    export type Invitations<TUsing extends Array<"organizationId" | "inviterId"> | "all" = [
    ]> = Array<Invitation<TUsing>> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type Member<TUsing extends Array<"userId" | "organizationId"> | "all" = [
    ]> = ResultRecord & {
        createdAt: Date;
        organizationId: ResolveSchema<Organization, TUsing, "organizationId">;
        role: string;
        userId: ResolveSchema<User, TUsing, "userId">;
    };
    export type Members<TUsing extends Array<"userId" | "organizationId"> | "all" = [
    ]> = Array<Member<TUsing>> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type Otp = ResultRecord & {
        attempts: number;
        createdAt: Date;
        expiresAt: Date;
        identifier: string;
        type: string;
        value: string;
    };
    export type Otps = Array<Otp> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type SchoolAdmin<TUsing extends Array<"userId" | "schoolId"> | "all" = [
    ]> = ResultRecord & {
        createdAt: Date;
        schoolId: ResolveSchema<School, TUsing, "schoolId">;
        updatedAt: Date;
        userId: ResolveSchema<User, TUsing, "userId">;
    };
    export type SchoolAdmins<TUsing extends Array<"userId" | "schoolId"> | "all" = [
    ]> = Array<SchoolAdmin<TUsing>> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type Student<TUsing extends Array<"userId"> | "all" = [
    ]> = ResultRecord & {
        createdAt: Date;
        grade: string;
        updatedAt: Date;
        userId: ResolveSchema<User, TUsing, "userId">;
    };
    export type Students<TUsing extends Array<"userId"> | "all" = [
    ]> = Array<Student<TUsing>> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type StudentClass<TUsing extends Array<"studentId" | "classId"> | "all" = [
    ]> = ResultRecord & {
        classId: ResolveSchema<Class, TUsing, "classId">;
        completedAt: Date;
        enrolledAt: Date;
        finalGrade: string;
        status: string;
        studentId: ResolveSchema<Student, TUsing, "studentId">;
    };
    export type StudentClasses<TUsing extends Array<"studentId" | "classId"> | "all" = [
    ]> = Array<StudentClass<TUsing>> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type StudentTeacher<TUsing extends Array<"studentId" | "teacherId"> | "all" = [
    ]> = ResultRecord & {
        assignedAt: Date;
        status: string;
        studentId: ResolveSchema<Student, TUsing, "studentId">;
        teacherId: ResolveSchema<Teacher, TUsing, "teacherId">;
    };
    export type StudentTeachers<TUsing extends Array<"studentId" | "teacherId"> | "all" = [
    ]> = Array<StudentTeacher<TUsing>> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type TeacherSchool<TUsing extends Array<"teacherId" | "schoolId" | "invitedBy"> | "all" = [
    ]> = ResultRecord & {
        department: string;
        invitedAt: Date;
        invitedBy: ResolveSchema<User, TUsing, "invitedBy">;
        joinedAt: Date;
        schoolId: ResolveSchema<School, TUsing, "schoolId">;
        status: string;
        teacherId: ResolveSchema<Teacher, TUsing, "teacherId">;
    };
    export type TeacherSchools<TUsing extends Array<"teacherId" | "schoolId" | "invitedBy"> | "all" = [
    ]> = Array<TeacherSchool<TUsing>> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type TeacherSubject<TUsing extends Array<"teacherId" | "subjectId"> | "all" = [
    ]> = ResultRecord & {
        createdAt: Date;
        gradeLevel: string;
        subjectId: ResolveSchema<Subject, TUsing, "subjectId">;
        teacherId: ResolveSchema<Teacher, TUsing, "teacherId">;
    };
    export type TeacherSubjects<TUsing extends Array<"teacherId" | "subjectId"> | "all" = [
    ]> = Array<TeacherSubject<TUsing>> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type UserRole<TUsing extends Array<"userId"> | "all" = [
    ]> = ResultRecord & {
        createdAt: Date;
        role: string;
        roleId: string;
        updatedAt: Date;
        userId: ResolveSchema<User, TUsing, "userId">;
    };
    export type UserRoles<TUsing extends Array<"userId"> | "all" = [
    ]> = Array<UserRole<TUsing>> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type Waitlist<TUsing extends Array<"approvedBy"> | "all" = [
    ]> = ResultRecord & {
        approvedAt: Date;
        approvedBy: ResolveSchema<User, TUsing, "approvedBy">;
        createdAt: Date;
        email: string;
        estimatedStudentCount: number;
        estimatedTeacherCount: number;
        isApproved: boolean;
        name: string;
        schoolAddress: string;
        schoolDistrict: string;
        schoolName: string;
        schoolPlaceId: string;
        schoolType: string;
        userType: string;
    };
    export type Waitlists<TUsing extends Array<"approvedBy"> | "all" = [
    ]> = Array<Waitlist<TUsing>> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type EducationalContext<TUsing extends Array<"teacherId"> | "all" = [
    ]> = ResultRecord & {
        createdAt: Date;
        defaultGradeLevels: string;
        description: string;
        isActive: boolean;
        name: string;
        teacherId: ResolveSchema<Teacher, TUsing, "teacherId">;
        type: string;
        updatedAt: Date;
    };
    export type EducationalContexts<TUsing extends Array<"teacherId"> | "all" = [
    ]> = Array<EducationalContext<TUsing>> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type GradeLevel<TUsing extends Array<"teacherId" | "schoolId"> | "all" = [
    ]> = ResultRecord & {
        category: string;
        code: string;
        createdAt: Date;
        description: string;
        educationType: string;
        isActive: boolean;
        name: string;
        schoolId: ResolveSchema<School, TUsing, "schoolId">;
        sortOrder: number;
        teacherId: ResolveSchema<Teacher, TUsing, "teacherId">;
        updatedAt: Date;
    };
    export type GradeLevels<TUsing extends Array<"teacherId" | "schoolId"> | "all" = [
    ]> = Array<GradeLevel<TUsing>> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    export type User = ResultRecord & {
        classId: string;
        createdAt: Date;
        department: string;
        displayUsername: string;
        email: string;
        emailVerified: boolean;
        grade: string;
        image: StoredObject;
        isActive: boolean;
        isIndependent: boolean;
        isVerified: boolean;
        name: string;
        role: string;
        schoolAddress: string;
        schoolDistrict: string;
        schoolId: string;
        schoolName: string;
        schoolPlaceId: string;
        schoolType: string;
        slug: string;
        studentCount: number;
        subjects: string;
        teacherCount: number;
        teacherId: string;
        updatedAt: Date;
        username: string;
    };
    export type Users = Array<User> & {
        moreBefore?: string;
        moreAfter?: string;
    };
    declare const get: {
        /* Get a single Account record */
        account: DeepCallable<GetQuery[keyof GetQuery], Account | null>;
        /* Get multiple Account records */
        accounts: DeepCallable<GetQuery[keyof GetQuery], Accounts>;
        /* Get a single Session record */
        session: DeepCallable<GetQuery[keyof GetQuery], Session | null>;
        /* Get multiple Session records */
        sessions: DeepCallable<GetQuery[keyof GetQuery], Sessions>;
        /* Get a single Verification record */
        verification: DeepCallable<GetQuery[keyof GetQuery], Verification | null>;
        /* Get multiple Verification records */
        verifications: DeepCallable<GetQuery[keyof GetQuery], Verifications>;
        /* Get a single Teacher record */
        teacher: DeepCallable<GetQuery[keyof GetQuery], Teacher | null>;
        /* Get multiple Teacher records */
        teachers: DeepCallable<GetQuery[keyof GetQuery], Teachers>;
        /* Get a single School record */
        school: DeepCallable<GetQuery[keyof GetQuery], School | null>;
        /* Get multiple School records */
        schools: DeepCallable<GetQuery[keyof GetQuery], Schools>;
        /* Get a single Subject record */
        subject: DeepCallable<GetQuery[keyof GetQuery], Subject | null>;
        /* Get multiple Subject records */
        subjects: DeepCallable<GetQuery[keyof GetQuery], Subjects>;
        /* Get a single Class record */
        class: DeepCallable<GetQuery[keyof GetQuery], Class | null>;
        /* Get multiple Class records */
        classes: DeepCallable<GetQuery[keyof GetQuery], Classes>;
        /* Get a single Organization record */
        organization: DeepCallable<GetQuery[keyof GetQuery], Organization | null>;
        /* Get multiple Organization records */
        organizations: DeepCallable<GetQuery[keyof GetQuery], Organizations>;
        /* Get a single Invitation record */
        invitation: DeepCallable<GetQuery[keyof GetQuery], Invitation | null>;
        /* Get multiple Invitation records */
        invitations: DeepCallable<GetQuery[keyof GetQuery], Invitations>;
        /* Get a single Member record */
        member: DeepCallable<GetQuery[keyof GetQuery], Member | null>;
        /* Get multiple Member records */
        members: DeepCallable<GetQuery[keyof GetQuery], Members>;
        /* Get a single Otp record */
        otp: DeepCallable<GetQuery[keyof GetQuery], Otp | null>;
        /* Get multiple Otp records */
        otps: DeepCallable<GetQuery[keyof GetQuery], Otps>;
        /* Get a single School Admin record */
        schoolAdmin: DeepCallable<GetQuery[keyof GetQuery], SchoolAdmin | null>;
        /* Get multiple School Admin records */
        schoolAdmins: DeepCallable<GetQuery[keyof GetQuery], SchoolAdmins>;
        /* Get a single Student record */
        student: DeepCallable<GetQuery[keyof GetQuery], Student | null>;
        /* Get multiple Student records */
        students: DeepCallable<GetQuery[keyof GetQuery], Students>;
        /* Get a single Student Class record */
        studentClass: DeepCallable<GetQuery[keyof GetQuery], StudentClass | null>;
        /* Get multiple Student Class records */
        studentClasses: DeepCallable<GetQuery[keyof GetQuery], StudentClasses>;
        /* Get a single Student Teacher record */
        studentTeacher: DeepCallable<GetQuery[keyof GetQuery], StudentTeacher | null>;
        /* Get multiple Student Teacher records */
        studentTeachers: DeepCallable<GetQuery[keyof GetQuery], StudentTeachers>;
        /* Get a single Teacher School record */
        teacherSchool: DeepCallable<GetQuery[keyof GetQuery], TeacherSchool | null>;
        /* Get multiple Teacher School records */
        teacherSchools: DeepCallable<GetQuery[keyof GetQuery], TeacherSchools>;
        /* Get a single Teacher Subject record */
        teacherSubject: DeepCallable<GetQuery[keyof GetQuery], TeacherSubject | null>;
        /* Get multiple Teacher Subject records */
        teacherSubjects: DeepCallable<GetQuery[keyof GetQuery], TeacherSubjects>;
        /* Get a single User Role record */
        userRole: DeepCallable<GetQuery[keyof GetQuery], UserRole | null>;
        /* Get multiple User Role records */
        userRoles: DeepCallable<GetQuery[keyof GetQuery], UserRoles>;
        /* Get a single Waitlist record */
        waitlist: DeepCallable<GetQuery[keyof GetQuery], Waitlist | null>;
        /* Get multiple Waitlist records */
        waitlists: DeepCallable<GetQuery[keyof GetQuery], Waitlists>;
        /* Get a single Educational Context record */
        educationalContext: DeepCallable<GetQuery[keyof GetQuery], EducationalContext | null>;
        /* Get multiple Educational Context records */
        educationalContexts: DeepCallable<GetQuery[keyof GetQuery], EducationalContexts>;
        /* Get a single Grade Level record */
        gradeLevel: DeepCallable<GetQuery[keyof GetQuery], GradeLevel | null>;
        /* Get multiple Grade Level records */
        gradeLevels: DeepCallable<GetQuery[keyof GetQuery], GradeLevels>;
        /* Get a single User record */
        user: DeepCallable<GetQuery[keyof GetQuery], User | null>;
        /* Get multiple User records */
        users: DeepCallable<GetQuery[keyof GetQuery], Users>;
    };
    declare const count: {
        /* Count multiple Account records */
        accounts: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Session records */
        sessions: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Verification records */
        verifications: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Teacher records */
        teachers: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple School records */
        schools: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Subject records */
        subjects: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Class records */
        classes: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Organization records */
        organizations: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Invitation records */
        invitations: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Member records */
        members: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Otp records */
        otps: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple School Admin records */
        schoolAdmins: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Student records */
        students: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Student Class records */
        studentClasses: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Student Teacher records */
        studentTeachers: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Teacher School records */
        teacherSchools: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Teacher Subject records */
        teacherSubjects: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple User Role records */
        userRoles: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Waitlist records */
        waitlists: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Educational Context records */
        educationalContexts: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple Grade Level records */
        gradeLevels: DeepCallable<CountQuery[keyof CountQuery], number>;
        /* Count multiple User records */
        users: DeepCallable<CountQuery[keyof CountQuery], number>;
    };
    declare const set: {
        /* Set a single Account record */
        account: DeepCallable<SetQuery[keyof SetQuery], Account | null>;
        /* Set multiple Account records */
        accounts: DeepCallable<SetQuery[keyof SetQuery], Accounts>;
        /* Set a single Session record */
        session: DeepCallable<SetQuery[keyof SetQuery], Session | null>;
        /* Set multiple Session records */
        sessions: DeepCallable<SetQuery[keyof SetQuery], Sessions>;
        /* Set a single Verification record */
        verification: DeepCallable<SetQuery[keyof SetQuery], Verification | null>;
        /* Set multiple Verification records */
        verifications: DeepCallable<SetQuery[keyof SetQuery], Verifications>;
        /* Set a single Teacher record */
        teacher: DeepCallable<SetQuery[keyof SetQuery], Teacher | null>;
        /* Set multiple Teacher records */
        teachers: DeepCallable<SetQuery[keyof SetQuery], Teachers>;
        /* Set a single School record */
        school: DeepCallable<SetQuery[keyof SetQuery], School | null>;
        /* Set multiple School records */
        schools: DeepCallable<SetQuery[keyof SetQuery], Schools>;
        /* Set a single Subject record */
        subject: DeepCallable<SetQuery[keyof SetQuery], Subject | null>;
        /* Set multiple Subject records */
        subjects: DeepCallable<SetQuery[keyof SetQuery], Subjects>;
        /* Set a single Class record */
        class: DeepCallable<SetQuery[keyof SetQuery], Class | null>;
        /* Set multiple Class records */
        classes: DeepCallable<SetQuery[keyof SetQuery], Classes>;
        /* Set a single Organization record */
        organization: DeepCallable<SetQuery[keyof SetQuery], Organization | null>;
        /* Set multiple Organization records */
        organizations: DeepCallable<SetQuery[keyof SetQuery], Organizations>;
        /* Set a single Invitation record */
        invitation: DeepCallable<SetQuery[keyof SetQuery], Invitation | null>;
        /* Set multiple Invitation records */
        invitations: DeepCallable<SetQuery[keyof SetQuery], Invitations>;
        /* Set a single Member record */
        member: DeepCallable<SetQuery[keyof SetQuery], Member | null>;
        /* Set multiple Member records */
        members: DeepCallable<SetQuery[keyof SetQuery], Members>;
        /* Set a single Otp record */
        otp: DeepCallable<SetQuery[keyof SetQuery], Otp | null>;
        /* Set multiple Otp records */
        otps: DeepCallable<SetQuery[keyof SetQuery], Otps>;
        /* Set a single School Admin record */
        schoolAdmin: DeepCallable<SetQuery[keyof SetQuery], SchoolAdmin | null>;
        /* Set multiple School Admin records */
        schoolAdmins: DeepCallable<SetQuery[keyof SetQuery], SchoolAdmins>;
        /* Set a single Student record */
        student: DeepCallable<SetQuery[keyof SetQuery], Student | null>;
        /* Set multiple Student records */
        students: DeepCallable<SetQuery[keyof SetQuery], Students>;
        /* Set a single Student Class record */
        studentClass: DeepCallable<SetQuery[keyof SetQuery], StudentClass | null>;
        /* Set multiple Student Class records */
        studentClasses: DeepCallable<SetQuery[keyof SetQuery], StudentClasses>;
        /* Set a single Student Teacher record */
        studentTeacher: DeepCallable<SetQuery[keyof SetQuery], StudentTeacher | null>;
        /* Set multiple Student Teacher records */
        studentTeachers: DeepCallable<SetQuery[keyof SetQuery], StudentTeachers>;
        /* Set a single Teacher School record */
        teacherSchool: DeepCallable<SetQuery[keyof SetQuery], TeacherSchool | null>;
        /* Set multiple Teacher School records */
        teacherSchools: DeepCallable<SetQuery[keyof SetQuery], TeacherSchools>;
        /* Set a single Teacher Subject record */
        teacherSubject: DeepCallable<SetQuery[keyof SetQuery], TeacherSubject | null>;
        /* Set multiple Teacher Subject records */
        teacherSubjects: DeepCallable<SetQuery[keyof SetQuery], TeacherSubjects>;
        /* Set a single User Role record */
        userRole: DeepCallable<SetQuery[keyof SetQuery], UserRole | null>;
        /* Set multiple User Role records */
        userRoles: DeepCallable<SetQuery[keyof SetQuery], UserRoles>;
        /* Set a single Waitlist record */
        waitlist: DeepCallable<SetQuery[keyof SetQuery], Waitlist | null>;
        /* Set multiple Waitlist records */
        waitlists: DeepCallable<SetQuery[keyof SetQuery], Waitlists>;
        /* Set a single Educational Context record */
        educationalContext: DeepCallable<SetQuery[keyof SetQuery], EducationalContext | null>;
        /* Set multiple Educational Context records */
        educationalContexts: DeepCallable<SetQuery[keyof SetQuery], EducationalContexts>;
        /* Set a single Grade Level record */
        gradeLevel: DeepCallable<SetQuery[keyof SetQuery], GradeLevel | null>;
        /* Set multiple Grade Level records */
        gradeLevels: DeepCallable<SetQuery[keyof SetQuery], GradeLevels>;
        /* Set a single User record */
        user: DeepCallable<SetQuery[keyof SetQuery], User | null>;
        /* Set multiple User records */
        users: DeepCallable<SetQuery[keyof SetQuery], Users>;
    };
    declare const add: {
        /* Add a single Account record */
        account: DeepCallable<AddQuery[keyof AddQuery], Account | null>;
        /* Add a single Session record */
        session: DeepCallable<AddQuery[keyof AddQuery], Session | null>;
        /* Add a single Verification record */
        verification: DeepCallable<AddQuery[keyof AddQuery], Verification | null>;
        /* Add a single Teacher record */
        teacher: DeepCallable<AddQuery[keyof AddQuery], Teacher | null>;
        /* Add a single School record */
        school: DeepCallable<AddQuery[keyof AddQuery], School | null>;
        /* Add a single Subject record */
        subject: DeepCallable<AddQuery[keyof AddQuery], Subject | null>;
        /* Add a single Class record */
        class: DeepCallable<AddQuery[keyof AddQuery], Class | null>;
        /* Add a single Organization record */
        organization: DeepCallable<AddQuery[keyof AddQuery], Organization | null>;
        /* Add a single Invitation record */
        invitation: DeepCallable<AddQuery[keyof AddQuery], Invitation | null>;
        /* Add a single Member record */
        member: DeepCallable<AddQuery[keyof AddQuery], Member | null>;
        /* Add a single Otp record */
        otp: DeepCallable<AddQuery[keyof AddQuery], Otp | null>;
        /* Add a single School Admin record */
        schoolAdmin: DeepCallable<AddQuery[keyof AddQuery], SchoolAdmin | null>;
        /* Add a single Student record */
        student: DeepCallable<AddQuery[keyof AddQuery], Student | null>;
        /* Add a single Student Class record */
        studentClass: DeepCallable<AddQuery[keyof AddQuery], StudentClass | null>;
        /* Add a single Student Teacher record */
        studentTeacher: DeepCallable<AddQuery[keyof AddQuery], StudentTeacher | null>;
        /* Add a single Teacher School record */
        teacherSchool: DeepCallable<AddQuery[keyof AddQuery], TeacherSchool | null>;
        /* Add a single Teacher Subject record */
        teacherSubject: DeepCallable<AddQuery[keyof AddQuery], TeacherSubject | null>;
        /* Add a single User Role record */
        userRole: DeepCallable<AddQuery[keyof AddQuery], UserRole | null>;
        /* Add a single Waitlist record */
        waitlist: DeepCallable<AddQuery[keyof AddQuery], Waitlist | null>;
        /* Add a single Educational Context record */
        educationalContext: DeepCallable<AddQuery[keyof AddQuery], EducationalContext | null>;
        /* Add a single Grade Level record */
        gradeLevel: DeepCallable<AddQuery[keyof AddQuery], GradeLevel | null>;
        /* Add a single User record */
        user: DeepCallable<AddQuery[keyof AddQuery], User | null>;
    };
    declare const remove: {
        /* Remove a single Account record */
        account: DeepCallable<RemoveQuery[keyof RemoveQuery], Account | null>;
        /* Remove multiple Account records */
        accounts: DeepCallable<RemoveQuery[keyof RemoveQuery], Accounts>;
        /* Remove a single Session record */
        session: DeepCallable<RemoveQuery[keyof RemoveQuery], Session | null>;
        /* Remove multiple Session records */
        sessions: DeepCallable<RemoveQuery[keyof RemoveQuery], Sessions>;
        /* Remove a single Verification record */
        verification: DeepCallable<RemoveQuery[keyof RemoveQuery], Verification | null>;
        /* Remove multiple Verification records */
        verifications: DeepCallable<RemoveQuery[keyof RemoveQuery], Verifications>;
        /* Remove a single Teacher record */
        teacher: DeepCallable<RemoveQuery[keyof RemoveQuery], Teacher | null>;
        /* Remove multiple Teacher records */
        teachers: DeepCallable<RemoveQuery[keyof RemoveQuery], Teachers>;
        /* Remove a single School record */
        school: DeepCallable<RemoveQuery[keyof RemoveQuery], School | null>;
        /* Remove multiple School records */
        schools: DeepCallable<RemoveQuery[keyof RemoveQuery], Schools>;
        /* Remove a single Subject record */
        subject: DeepCallable<RemoveQuery[keyof RemoveQuery], Subject | null>;
        /* Remove multiple Subject records */
        subjects: DeepCallable<RemoveQuery[keyof RemoveQuery], Subjects>;
        /* Remove a single Class record */
        class: DeepCallable<RemoveQuery[keyof RemoveQuery], Class | null>;
        /* Remove multiple Class records */
        classes: DeepCallable<RemoveQuery[keyof RemoveQuery], Classes>;
        /* Remove a single Organization record */
        organization: DeepCallable<RemoveQuery[keyof RemoveQuery], Organization | null>;
        /* Remove multiple Organization records */
        organizations: DeepCallable<RemoveQuery[keyof RemoveQuery], Organizations>;
        /* Remove a single Invitation record */
        invitation: DeepCallable<RemoveQuery[keyof RemoveQuery], Invitation | null>;
        /* Remove multiple Invitation records */
        invitations: DeepCallable<RemoveQuery[keyof RemoveQuery], Invitations>;
        /* Remove a single Member record */
        member: DeepCallable<RemoveQuery[keyof RemoveQuery], Member | null>;
        /* Remove multiple Member records */
        members: DeepCallable<RemoveQuery[keyof RemoveQuery], Members>;
        /* Remove a single Otp record */
        otp: DeepCallable<RemoveQuery[keyof RemoveQuery], Otp | null>;
        /* Remove multiple Otp records */
        otps: DeepCallable<RemoveQuery[keyof RemoveQuery], Otps>;
        /* Remove a single School Admin record */
        schoolAdmin: DeepCallable<RemoveQuery[keyof RemoveQuery], SchoolAdmin | null>;
        /* Remove multiple School Admin records */
        schoolAdmins: DeepCallable<RemoveQuery[keyof RemoveQuery], SchoolAdmins>;
        /* Remove a single Student record */
        student: DeepCallable<RemoveQuery[keyof RemoveQuery], Student | null>;
        /* Remove multiple Student records */
        students: DeepCallable<RemoveQuery[keyof RemoveQuery], Students>;
        /* Remove a single Student Class record */
        studentClass: DeepCallable<RemoveQuery[keyof RemoveQuery], StudentClass | null>;
        /* Remove multiple Student Class records */
        studentClasses: DeepCallable<RemoveQuery[keyof RemoveQuery], StudentClasses>;
        /* Remove a single Student Teacher record */
        studentTeacher: DeepCallable<RemoveQuery[keyof RemoveQuery], StudentTeacher | null>;
        /* Remove multiple Student Teacher records */
        studentTeachers: DeepCallable<RemoveQuery[keyof RemoveQuery], StudentTeachers>;
        /* Remove a single Teacher School record */
        teacherSchool: DeepCallable<RemoveQuery[keyof RemoveQuery], TeacherSchool | null>;
        /* Remove multiple Teacher School records */
        teacherSchools: DeepCallable<RemoveQuery[keyof RemoveQuery], TeacherSchools>;
        /* Remove a single Teacher Subject record */
        teacherSubject: DeepCallable<RemoveQuery[keyof RemoveQuery], TeacherSubject | null>;
        /* Remove multiple Teacher Subject records */
        teacherSubjects: DeepCallable<RemoveQuery[keyof RemoveQuery], TeacherSubjects>;
        /* Remove a single User Role record */
        userRole: DeepCallable<RemoveQuery[keyof RemoveQuery], UserRole | null>;
        /* Remove multiple User Role records */
        userRoles: DeepCallable<RemoveQuery[keyof RemoveQuery], UserRoles>;
        /* Remove a single Waitlist record */
        waitlist: DeepCallable<RemoveQuery[keyof RemoveQuery], Waitlist | null>;
        /* Remove multiple Waitlist records */
        waitlists: DeepCallable<RemoveQuery[keyof RemoveQuery], Waitlists>;
        /* Remove a single Educational Context record */
        educationalContext: DeepCallable<RemoveQuery[keyof RemoveQuery], EducationalContext | null>;
        /* Remove multiple Educational Context records */
        educationalContexts: DeepCallable<RemoveQuery[keyof RemoveQuery], EducationalContexts>;
        /* Remove a single Grade Level record */
        gradeLevel: DeepCallable<RemoveQuery[keyof RemoveQuery], GradeLevel | null>;
        /* Remove multiple Grade Level records */
        gradeLevels: DeepCallable<RemoveQuery[keyof RemoveQuery], GradeLevels>;
        /* Remove a single User record */
        user: DeepCallable<RemoveQuery[keyof RemoveQuery], User | null>;
        /* Remove multiple User records */
        users: DeepCallable<RemoveQuery[keyof RemoveQuery], Users>;
    };
    declare const batch: <TQueries extends [
        Promise,
        ...Array<Promise>
    ] | Array<Promise>>(operations: () => TQueries, queryOptions?: Record<string, unknown>) => Promise<PromiseTuple<TQueries>>;
    declare const list: {
        /* List all model definitions */
        models: DeepCallable<ListQuery[keyof ListQuery], Array<Model>>;
    };
    declare const createSyntaxFactory: (options: QueryHandlerOptions | (() => QueryHandlerOptions)) => {
        get: typeof get;
        count: typeof count;
        set: typeof set;
        add: typeof add;
        remove: typeof remove;
        list: typeof list;
        create: typeof import("ronin").create;
        alter: typeof import("ronin").alter;
        drop: typeof import("ronin").drop;
        batch: typeof import("ronin").batch;
        sql: typeof import("ronin").sql;
        sqlBatch: typeof import("ronin").sqlBatch;
    };
    export default function (options: QueryHandlerOptions | (() => QueryHandlerOptions)): {
        get: typeof get;
        count: typeof count;
        set: typeof set;
        add: typeof add;
        remove: typeof remove;
        list: typeof list;
        create: typeof import("ronin").create;
        alter: typeof import("ronin").alter;
        drop: typeof import("ronin").drop;
        batch: typeof import("ronin").batch;
        sql: typeof import("ronin").sql;
        sqlBatch: typeof import("ronin").sqlBatch;
    };
}
