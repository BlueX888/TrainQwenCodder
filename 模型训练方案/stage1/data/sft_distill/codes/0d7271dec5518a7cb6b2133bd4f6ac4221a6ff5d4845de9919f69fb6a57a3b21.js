class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0; // 当前已跳跃次数
    this.maxJumps = 2; // 最大跳跃次数
    this.jumpPower = -160; // 跳跃力度（负值向上）
    this.remainingJumps = 2; // 剩余跳跃次数（状态信号）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 程序化生成玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 程序化生成地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建地面平台
    this.ground = this.physics.add.staticSprite(400, 575, 'ground');
    this.ground.refreshBody();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置玩家与地面的碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      // 当玩家接触地面时重置跳跃计数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        this.remainingJumps = this.maxJumps;
        this.updateStatusText();
      }
    });

    // 监听空格键
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加状态文本显示
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加说明文字
    this.add.text(16, 50, '按空格键跳跃（最多2次）', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加左右移动说明
    this.add.text(16, 80, '方向键左右移动', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update() {
    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 双跳逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.jumpCount < this.maxJumps) {
        this.player.setVelocityY(this.jumpPower);
        this.jumpCount++;
        this.remainingJumps = this.maxJumps - this.jumpCount;
        this.updateStatusText();
        
        // 添加视觉反馈
        this.tweens.add({
          targets: this.player,
          scaleX: 1.1,
          scaleY: 0.9,
          duration: 100,
          yoyo: true
        });
      }
    }

    // 如果玩家在空中且速度向上变为向下，更新状态
    if (!this.player.body.touching.down && this.player.body.velocity.y > 0) {
      this.updateStatusText();
    }
  }

  updateStatusText() {
    const onGround = this.player.body.touching.down ? '是' : '否';
    this.statusText.setText(
      `剩余跳跃次数: ${this.remainingJumps}/${this.maxJumps}\n` +
      `已跳跃次数: ${this.jumpCount}\n` +
      `在地面上: ${onGround}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);