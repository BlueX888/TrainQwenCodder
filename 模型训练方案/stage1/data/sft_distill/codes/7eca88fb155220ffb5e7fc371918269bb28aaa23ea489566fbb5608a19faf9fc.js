class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformDirection = 1; // 1: 向右, -1: 向左
    this.platformPosition = 0; // 平台当前位置（用于验证）
    this.playerOnPlatform = false; // 玩家是否在平台上
  }

  preload() {
    // 创建黄色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xffff00, 1); // 黄色
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建蓝色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1); // 蓝色
    playerGraphics.fillRect(0, 0, 40, 60);
    playerGraphics.generateTexture('player', 40, 60);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1); // 灰色
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 添加背景颜色
    this.cameras.main.setBackgroundColor('#87CEEB');

    // 创建地面（静态平台）
    this.ground = this.physics.add.sprite(400, 580, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(120 * this.platformDirection);
    
    // 设置平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platform, () => {
      // 当玩家站在平台上时，标记状态
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.playerOnPlatform = true;
      }
    });

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态文本显示
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 重置平台状态
    this.playerOnPlatform = false;

    // 平台往返移动逻辑
    if (this.platform.x <= this.platformMinX) {
      this.platformDirection = 1; // 向右
      this.platform.setVelocityX(120 * this.platformDirection);
      this.platform.x = this.platformMinX;
    } else if (this.platform.x >= this.platformMaxX) {
      this.platformDirection = -1; // 向左
      this.platform.setVelocityX(120 * this.platformDirection);
      this.platform.x = this.platformMaxX;
    }

    // 记录平台位置（状态信号）
    this.platformPosition = Math.round(this.platform.x);

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // 当玩家站在平台上时，跟随平台移动
    if (this.player.body.touching.down && this.platform.body.touching.up) {
      // 计算玩家与平台的相对位置
      const overlap = Phaser.Geom.Intersects.RectangleToRectangle(
        this.player.getBounds(),
        this.platform.getBounds()
      );
      
      if (overlap && this.player.body.velocity.y >= 0) {
        this.playerOnPlatform = true;
        // 如果玩家没有主动移动，跟随平台
        if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
          this.player.x += this.platform.body.velocity.x * (delta / 1000);
        }
      }
    }

    // 更新状态显示
    this.statusText.setText([
      `Platform Position: ${this.platformPosition}`,
      `Platform Direction: ${this.platformDirection === 1 ? 'Right' : 'Left'}`,
      `Player on Platform: ${this.playerOnPlatform}`,
      `Player Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `\nControls: Arrow Keys to Move, Up to Jump`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);