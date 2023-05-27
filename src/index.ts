import FormData from 'form-data';
import fs from 'fs';
import got from 'got';
import path from 'path';

interface ICustomerIdInfoToAStatement {
  statementKey: number;
  idName: string;
  value: string;
}
interface IAffordabilityAnalysis {
  dti: string;
  statementKey: number;
  tenure: number;
  averageMonthlyRepayment: any[];
  averageMonthlyTotalExpenses: any[];
}

interface IPericulum {
  clientID: string;
  clientSecret: string;
  baseUrl?: string;
}
interface IStateAnalysis {
  statementName: string;
  statementType: string;
  accountType: string;
  accountName: string;
  bankName: string;
  clientFullName: string;
  format: string;
  transactions: any[];
}
interface IStatementAnalysisPDF {
  file: any;
  password: string;
  statementType: string;
}

class Periculum {
  clientID: string;
  accessToken: string | undefined;
  clientSecret: string;
  baseUrl = 'https://api.insights-periculum.com/';

  constructor({ clientID, clientSecret, baseUrl }: IPericulum) {
    this.clientID = clientID;
    this.clientSecret = clientSecret;
    if (baseUrl) {
      this.baseUrl = baseUrl;
    }
    this.authentication();
  }

  async authentication() {
    try {
      const json = {
        client_id: this.clientID,
        client_secret: this.clientSecret,
        audience: 'https://api.insights-periculum.com',
        grant_type: 'client_credentials',
      };
      const endpoint =
        'https://periculum-technologies-inc.auth0.com/oauth/token';

      const response = await got
        .post(endpoint, {
          headers: {
            'Content-Type': 'application/json',
          },
          json,
        })
        .json();
      console.log({ response });
      // this.accessToken = response.access_token;

      return response;
    } catch (error: any) {
      return error.message;
    }
  }

  /**
   *
   * @param {object} {statementName, statementType, format, transactions}
   * @returns
   */

  async generateStatementAnalysis({
    statementName,
    statementType,
    accountType,
    accountName,
    bankName,
    clientFullName,
    format,
    transactions,
  }: IStateAnalysis) {
    try {
      const json = {
        statementName,
        accountType,
        accountName,
        bankName,
        clientFullName,
        transactions,
      };
      const endpoint =
        this.baseUrl +
        `statements/analytics?format=${format}&statementType=${statementType}`;

      const response = await got
        .post(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
          json,
        })
        .json();
      console.log({ response });

      return response;
    } catch (error: any) {
      return error.message;
    }
  }

  /**
   *
   * @param {object} { file, password, statementType }
   * @returns
   */

  async generateStatementAnalysisByPDF({
    file,
    password,
    statementType,
  }: IStatementAnalysisPDF) {
    try {
      const form = new FormData();
      const filePath = path.join('/usr/src/app/', file.path + '.pdf');
      console.log({ filePath });

      form.append('statementType', statementType);
      form.append('password', password);
      form.append('file', fs.createReadStream(filePath));
      const json = form;
      const endpoint = this.baseUrl + 'statements';

      const response = await got
        .post(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
          json,
        })
        .json();
      console.log({ response });
      return response;
    } catch (error: any) {
      return error.message;
    }
  }

  /**
   *
   * @param {number} statementKey
   * @returns
   */

  async getStatementAnalysis(statementKey: number) {
    try {
      await this.authentication();
      const endpoint = this.baseUrl + `statements/${statementKey}`;

      const response = await got(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }).json();
      console.log({ response });

      return response;
    } catch (error: any) {
      return error.message;
    }
  }

  /**
   *
   * @param {number} statementKey
   * @returns
   */
  async getStatementTransactions(statementKey: number) {
    try {
      await this.authentication();
      const endpoint = this.baseUrl + `statements/${statementKey}/transactions`;

      const response = await got(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }).json();
      console.log({ response });
      return response;
    } catch (error: any) {
      return error.message;
    }
  }

  async attachCustomerIdInfoToAStatement({
    statementKey,
    idName,
    value,
  }: ICustomerIdInfoToAStatement) {
    try {
      await this.authentication();
      const json = {
        statementKey,
        identificationData: [
          {
            IdentifierName: idName,
            Value: value,
          },
        ],
      };
      const endpoint = this.baseUrl + `statements/identification`;

      const response = await got
        .patch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
          json,
        })
        .json();
      return response;
    } catch (error: any) {
      return error.message;
    }
  }

  async generateAffordabilityAnalysis({
    dti,
    statementKey,
    tenure,
    averageMonthlyRepayment,
    averageMonthlyTotalExpenses,
  }: IAffordabilityAnalysis) {
    try {
      await this.authentication();
      const json = {
        dti,
        statementKey,
        loanTenure: tenure,
        averageMonthlyTotalExpenses,
        averageMonthlyLoanRepaymentAmount: averageMonthlyRepayment,
      };
      const endpoint = this.baseUrl + 'affordability';

      const response = await got
        .post(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
          json,
        })
        .json();
      return response;
    } catch (error: any) {
      return error.message;
    }
  }

  /**
   *
   * @param {number} statementKey
   * @returns
   */
  async getAffordabilityAnalysis(statementKey: number) {
    try {
      const json = {};
      const endpoint = this.baseUrl + `affordability/${statementKey}`;
      const response = await got
        .post(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
          json,
        })
        .json();
      return response;
    } catch (error: any) {
      return error.message;
    }
  }

  /**
   *
   * @param {number} statementKey
   * @returns
   */
  async generateCreditScore(statementKey: number) {
    try {
      await this.authentication();
      const json = {};
      const endpoint = this.baseUrl + `creditscore${statementKey}`;

      const response = await got
        .post(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
          json,
        })
        .json();
      return response;
    } catch (error: any) {
      return error.message;
    }
  }

  /**
   *
   * @param {number} statementKey
   * @returns
   */
  async getCreditScore(statementKey: number) {
    try {
      const endpoint = this.baseUrl + `creditscore${statementKey}`;
      const response = await got
        .get(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
        })
        .json();
      return response;
    } catch (error: any) {
      return error.message;
    }
  }
}

export default Periculum;
