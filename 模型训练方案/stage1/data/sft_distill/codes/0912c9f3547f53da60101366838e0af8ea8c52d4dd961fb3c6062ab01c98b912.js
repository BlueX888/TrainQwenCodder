class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformBounces = 0; // 可验证状态：平台碰撞边界次数
    this.playerOnPlatform = false; // 玩家是否在平台上
  }

  preload() {
    // 创建黄色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xffff00, 1); // 黄色
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建蓝色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0099ff, 1); // 蓝色
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1); // 灰色
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建地面
    this.ground = this.physics.add.sprite(400, 580, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    
    // 设置平台速度和边界碰撞
    this.platform.setVelocityX(120);
    this.platform.setCollideWorldBounds(true);
    this.platform.setBounce(1, 0); // 水平方向完全反弹
    
    // 监听平台碰撞世界边界事件
    this.platform.body.onWorldBounds = true;
    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject === this.platform) {
        this.platformBounces++;
      }
    });

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 玩家与地面碰撞
    this.physics.add.collider(this.player, this.ground);
    
    // 玩家与平台碰撞 - 关键：使用collider确保玩家能站在平台上
    this.platformCollider = this.physics.add.collider(
      this.player, 
      this.platform,
      this.onPlayerPlatformCollide,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.add.text(10, 550, 'Arrow Keys: Move | Space: Jump', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  onPlayerPlatformCollide(player, platform) {
    // 检测玩家是否在平台上方
    if (player.body.touching.down && platform.body.touching.up) {
      this.playerOnPlatform = true;
      
      // 让玩家跟随平台移动（通过匹配水平速度）
      // 注意：Phaser的collider已经处理了基本的碰撞，
      // 但为了更好的跟随效果，我们可以微调玩家速度
      if (Math.abs(player.body.velocity.x) < 10) {
        // 如果玩家没有主动移动，让其完全跟随平台
        player.body.velocity.x = platform.body.velocity.x;
      }
    } else {
      this.playerOnPlatform = false;
    }
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText([
      `Platform Bounces: ${this.platformBounces}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Platform Velocity: ${Math.round(this.platform.body.velocity.x)}`,
      `Player Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    ]);

    // 玩家左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家在平台上且没有按键，保持平台速度
      if (this.player.body.touching.down && this.playerOnPlatform) {
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else if (this.player.body.touching.down) {
        // 在地面上时减速
        this.player.setVelocityX(this.player.body.velocity.x * 0.8);
      }
    }

    // 跳跃控制
    if (this.cursors.space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 检测玩家是否离开平台
    if (!this.player.body.touching.down) {
      this.playerOnPlatform = false;
    }
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
      gravity: { y: 800 }, // 重力设置为800
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);