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
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffff00, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();
  }

  create() {
    // 创建平台组
    this.platforms = this.physics.add.staticGroup();

    // 地面平台
    const ground = this.platforms.create(400, 580, 'platform');
    ground.setScale(4, 1).refreshBody();

    // 中间平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(400, 300, 'platform');
    this.platforms.create(100, 200, 'platform');
    this.platforms.create(700, 250, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 创建金币组
    this.coins = this.physics.add.group({
      key: 'coin',
      repeat: 11, // 总共12个金币
      setXY: { x: 80, y: 0, stepX: 60 }
    });

    // 随机设置金币位置
    this.coins.children.iterate((coin, index) => {
      const positions = [
        { x: 100, y: 150 },
        { x: 200, y: 400 },
        { x: 250, y: 200 },
        { x: 400, y: 250 },
        { x: 450, y: 100 },
        { x: 600, y: 350 },
        { x: 650, y: 180 },
        { x: 700, y: 200 },
        { x: 300, y: 150 },
        { x: 500, y: 350 },
        { x: 350, y: 400 },
        { x: 550, y: 250 }
      ];
      
      if (positions[index]) {
        coin.setPosition(positions[index].x, positions[index].y);
      }
      
      // 金币轻微弹跳效果
      coin.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));
    });

    // 碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);

    // 重叠检测（收集金币）
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 游戏说明文本
    this.add.text(16, 56, 'Arrow keys to move, UP to jump', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    console.log('Game initialized. Total coins: 12, Current score:', this.score);
  }

  update() {
    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只有在地面或平台上才能跳）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.disableBody(true, true);

    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    console.log('Coin collected! Current score:', this.score);

    // 检查是否收集完所有金币
    if (this.score === 120) {
      console.log('All coins collected! You win!');
      this.add.text(400, 300, 'YOU WIN!', {
        fontSize: '64px',
        fill: '#ffff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);

      // 暂停游戏
      this.physics.pause();
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