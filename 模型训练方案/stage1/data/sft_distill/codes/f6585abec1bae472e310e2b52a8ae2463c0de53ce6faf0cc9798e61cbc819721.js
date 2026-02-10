class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformMoveCount = 0; // 平台移动方向改变次数
    this.playerOnPlatform = false; // 玩家是否在平台上
    this.gameTime = 0; // 游戏运行时间
  }

  preload() {
    // 创建橙色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xFF8800, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建蓝色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088FF, 1);
    playerGraphics.fillRect(0, 0, 40, 50);
    playerGraphics.generateTexture('player', 40, 50);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 添加背景文字说明
    this.add.text(10, 10, 'Arrow Keys to Move\nPlatform moves at 200 speed', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加状态显示
    this.statusText = this.add.text(10, 60, '', {
      fontSize: '14px',
      fill: '#00ff00'
    });

    // 创建地面
    this.ground = this.physics.add.sprite(400, 580, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.body.setVelocityX(200); // 初始速度向右200
    
    // 设置平台移动范围
    this.platformMinX = 200;
    this.platformMaxX = 600;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置玩家与平台、地面的碰撞
    this.physics.add.collider(this.player, this.platform, () => {
      this.playerOnPlatform = true;
    });
    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试信息
    console.log('Game initialized - Gravity: 1000, Platform speed: 200');
  }

  update(time, delta) {
    this.gameTime += delta;

    // 重置平台状态
    this.playerOnPlatform = false;

    // 平台往返移动逻辑
    if (this.platform.x >= this.platformMaxX && this.platform.body.velocity.x > 0) {
      this.platform.body.setVelocityX(-200);
      this.platformMoveCount++;
      console.log(`Platform reversed at ${this.platform.x}, count: ${this.platformMoveCount}`);
    } else if (this.platform.x <= this.platformMinX && this.platform.body.velocity.x < 0) {
      this.platform.body.setVelocityX(200);
      this.platformMoveCount++;
      console.log(`Platform reversed at ${this.platform.x}, count: ${this.platformMoveCount}`);
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只有在地面或平台上才能跳）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // 检测玩家是否在平台上
    if (this.player.body.touching.down && 
        this.physics.overlap(this.player, this.platform)) {
      this.playerOnPlatform = true;
      
      // 让玩家跟随平台移动
      this.player.x += this.platform.body.velocity.x * (delta / 1000);
    }

    // 更新状态显示
    this.statusText.setText([
      `Platform Direction Changes: ${this.platformMoveCount}`,
      `Player on Platform: ${this.playerOnPlatform}`,
      `Platform X: ${Math.round(this.platform.x)}`,
      `Platform Velocity: ${this.platform.body.velocity.x}`,
      `Game Time: ${Math.round(this.gameTime / 1000)}s`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);