// 全局变量用于验证
let gameScore = 0;

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.scoreText = null;
    this.player = null;
    this.platforms = null;
    this.coins = null;
    this.cursors = null;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffd700, 1);
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.lineStyle(2, 0xffaa00, 1);
    coinGraphics.strokeCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();
  }

  create() {
    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    this.scoreText.setScrollFactor(0);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();

    // 地面平台
    const ground = this.platforms.create(400, 568, 'platform');
    ground.setScale(4, 1).refreshBody();

    // 创建多个悬浮平台
    this.platforms.create(150, 450, 'platform');
    this.platforms.create(650, 400, 'platform');
    this.platforms.create(400, 300, 'platform');
    this.platforms.create(100, 250, 'platform');
    this.platforms.create(700, 200, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 创建金币组
    this.coins = this.physics.add.group();

    // 在平台上方创建8个金币
    const coinPositions = [
      { x: 150, y: 380 },
      { x: 650, y: 330 },
      { x: 400, y: 230 },
      { x: 100, y: 180 },
      { x: 700, y: 130 },
      { x: 300, y: 150 },
      { x: 500, y: 270 },
      { x: 250, y: 350 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.3);
      coin.setCollideWorldBounds(true);
      // 金币受重力影响会掉落到平台上
      coin.setGravityY(-500); // 抵消重力，让金币悬浮
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);

    // 添加金币收集检测
    this.physics.add.overlap(
      this.player,
      this.coins,
      this.collectCoin,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加游戏完成提示文本（隐藏）
    this.completeText = this.add.text(400, 300, 'All Coins Collected!', {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.completeText.setOrigin(0.5);
    this.completeText.setVisible(false);
  }

  collectCoin(player, coin) {
    // 移除金币
    coin.disableBody(true, true);

    // 增加分数
    this.score += 10;
    gameScore = this.score;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.coins.countActive(true) === 0) {
      this.completeText.setVisible(true);
      console.log('Game Complete! Final Score:', this.score);
    }
  }

  update() {
    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只有在地面或平台上才能跳跃）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出验证变量
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { gameScore, game };
}