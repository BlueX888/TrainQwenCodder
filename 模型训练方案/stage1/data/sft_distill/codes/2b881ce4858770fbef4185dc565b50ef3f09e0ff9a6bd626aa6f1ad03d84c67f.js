class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0; // 当前已跳跃次数
    this.maxJumps = 2; // 最大跳跃次数
    this.jumpVelocity = -160; // 跳跃力度
  }

  preload() {
    // 使用Graphics生成纹理，无需外部资源
  }

  create() {
    // 创建角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建地面
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建角色
    this.player = this.physics.add.sprite(100, 400, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground, () => {
      // 角色着地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
      }
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加操作提示
    this.add.text(16, 550, 'Press SPACE to jump (Double Jump Available)', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加背景色
    this.cameras.main.setBackgroundColor('#87ceeb');
  }

  update(time, delta) {
    // 更新状态显示
    const onGround = this.player.body.touching.down;
    this.statusText.setText([
      `Jump Count: ${this.jumpCount}/${this.maxJumps}`,
      `On Ground: ${onGround}`,
      `Velocity Y: ${Math.round(this.player.body.velocity.y)}`,
      `Position Y: ${Math.round(this.player.y)}`
    ]);

    // 检测角色是否在地面上
    if (this.player.body.touching.down) {
      this.jumpCount = 0;
    }

    // 处理跳跃输入
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      // 检查是否可以跳跃
      if (this.jumpCount < this.maxJumps) {
        this.player.setVelocityY(this.jumpVelocity);
        this.jumpCount++;
        
        // 视觉反馈：跳跃时改变颜色
        if (this.jumpCount === 1) {
          this.player.setTint(0xffff00); // 第一次跳跃：黄色
        } else if (this.jumpCount === 2) {
          this.player.setTint(0xff00ff); // 第二次跳跃：紫色
        }
      }
    }

    // 恢复原色（当在地面上时）
    if (this.player.body.touching.down) {
      this.player.clearTint();
    }

    // 简单的左右移动控制
    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);