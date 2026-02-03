class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 2; // 剩余跳跃次数
    this.maxJumps = 2; // 最大跳跃次数
    this.jumpForce = -360; // 跳跃力度（负值表示向上）
    this.statusText = null;
  }

  preload() {
    // 使用 Graphics 创建纹理，不依赖外部资源
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
    groundGraphics.fillStyle(0x8B4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建地面
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建额外平台用于测试
    this.platform1 = this.physics.add.sprite(300, 450, 'platform');
    this.platform1.setImmovable(true);
    this.platform1.body.allowGravity = false;

    this.platform2 = this.physics.add.sprite(500, 350, 'platform');
    this.platform2.setImmovable(true);
    this.platform2.body.allowGravity = false;

    // 创建角色
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground, this.onPlayerLand, null, this);
    this.physics.add.collider(this.player, this.platform1, this.onPlayerLand, null, this);
    this.physics.add.collider(this.player, this.platform2, this.onPlayerLand, null, this);

    // 添加键盘输入
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cursors = this.input.keyboard.createCursorKeys();

    // 状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 说明文本
    this.add.text(16, 50, 'SPACE: Jump (Max 2 jumps)\nArrows: Move', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 水平移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 双跳逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.jumpCount > 0) {
        this.player.setVelocityY(this.jumpForce);
        this.jumpCount--;
        this.updateStatusText();
        
        // 视觉反馈：跳跃时改变颜色
        this.player.setTint(this.jumpCount === 1 ? 0xffff00 : 0xff9900);
      }
    }

    // 检测是否在空中且速度向下（用于更精确的着地检测）
    if (this.player.body.velocity.y > 0 && this.player.body.touching.down) {
      if (this.jumpCount < this.maxJumps) {
        this.onPlayerLand();
      }
    }
  }

  onPlayerLand() {
    // 只有当角色确实着地时才重置跳跃次数
    if (this.player.body.touching.down && this.jumpCount < this.maxJumps) {
      this.jumpCount = this.maxJumps;
      this.player.clearTint();
      this.updateStatusText();
    }
  }

  updateStatusText() {
    const status = this.player.body.touching.down ? 'On Ground' : 'In Air';
    this.statusText.setText(
      `Jumps Remaining: ${this.jumpCount}/${this.maxJumps}\n` +
      `Status: ${status}\n` +
      `Y Velocity: ${Math.round(this.player.body.velocity.y)}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);