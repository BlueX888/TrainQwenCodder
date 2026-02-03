class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.player = null;
    this.platforms = null;
    this.coins = null;
    this.cursors = null;
    this.scoreText = null;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建平台纹理（灰色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建地面纹理（深灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x444444, 1);
    groundGraphics.fillRect(0, 0, 800, 32);
    groundGraphics.generateTexture('ground', 800, 32);
    groundGraphics.destroy();

    // 创建金币纹理（黄色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffdd00, 1);
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();
  }

  create() {
    // 创建静态平台组
    this.platforms = this.physics.add.staticGroup();

    // 添加地面
    const ground = this.platforms.create(400, 584, 'ground');
    ground.setScale(1).refreshBody();

    // 添加跳跃平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 380, 'platform');
    this.platforms.create(400, 280, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(0); // 使用世界重力

    // 创建金币组
    this.coins = this.physics.add.group({
      key: 'coin',
      repeat: 2,
      setXY: { x: 200, y: 350, stepX: 200 }
    });

    // 调整金币位置，使其更具挑战性
    this.coins.children.entries[0].setPosition(200, 350);
    this.coins.children.entries[1].setPosition(600, 280);
    this.coins.children.entries[2].setPosition(400, 180);

    // 设置金币的物理属性
    this.coins.children.iterate((coin) => {
      coin.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));
      coin.setCollideWorldBounds(true);
      coin.body.setAllowGravity(false); // 金币不受重力影响
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms);

    // 添加金币收集检测
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 添加游戏说明文本
    this.add.text(16, 56, 'Arrow Keys: Move & Jump', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.disableBody(true, true);

    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.coins.countActive(true) === 0) {
      // 显示胜利信息
      const winText = this.add.text(400, 300, 'YOU WIN!', {
        fontSize: '64px',
        fill: '#ffdd00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6
      });
      winText.setOrigin(0.5);

      // 暂停物理系统
      this.physics.pause();
    }
  }

  update(time, delta) {
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
      this.player.setVelocityY(-500);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);