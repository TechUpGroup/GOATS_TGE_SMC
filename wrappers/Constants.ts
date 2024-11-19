export abstract class Op {
    static transfer = 0xf8a7ea5;
    static transfer_notification = 0x7362d09c;
    static internal_transfer = 0x178d4519;
    static excesses = 0xd53276db;
    static burn = 0x595f07bc;
    static burn_notification = 0x7bdd97de;
    
    static provide_wallet_address = 0x2c76b973;
    static take_wallet_address = 0xd1735400;
    static mint = 21;
    static change_admin = 3;
    static change_content = 4;

    static transfer_nft = 0x5fcc3d14;
    static ownership_assigned = 0x05138d91;
    static excesses_nft = 0xd53276dc;
    static get_static_data = 0x2fcb26a2;
    static report_static_data = 0x8b771735;
    static get_royalty_params = 0x693d3950;
    static report_royalty_params = 0xa8cb00ad;

    static edit_content = 0x1a0b9d51;
    static transfer_editorship = 0x1c04412a;
    static editorship_assigned = 0x511a4463;

    static miner_start = 22;
    static miner_end = 23;
    static miner_claim = 24;
    static get_stake_static_data = 25;
    static report_stake_data = 26;
    static change_owner = 3;
    static change_nft_item = 4;

}

export abstract class Errors {
    static unknown_op = 101;
    static access_denied  = 102;
    static insufficient_balance = 103;
    static asic_miner_to_large = 104;
    static invalid_amount = 105;
    static cannot_end_miner_day = 106;
    static invalid_caller = 107;
    static exceed_claimable_reward = 108;
}

export abstract class Const {
    static min_tons_for_storage = 10000000;

    static provide_address_gas_consumption  = 10000000;

    static lauch_time = 1712534400;
    static max_miner_size = 140000000000;
    static min_mining_duration = 30;
    static withdraw_grace_period = 30;
    static days_for_penalty = 60;
    static min_mining_ton = 100000000;
    static decimal_resolution = 1000000000;
    static total_mintable_supply = 21000000000000000;
    static a_year   = 31536000;
}