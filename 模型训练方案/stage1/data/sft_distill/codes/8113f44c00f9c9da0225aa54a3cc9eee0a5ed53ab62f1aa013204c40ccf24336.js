class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // 状态信号：DOWN 或 UP
    this.gravityMagnitude = 600;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, width, 40);
    groundGraphics.generateTexture('ground', width, 40);
    groundGraphics.destroy();

    // 创建天花板纹理
    const ceilingGraphics = this.add.graphics();
    ceilingGraphics.fillStyle(0x4169e1, 1);
    ceilingGraphics.fillRect(0, 0, width, 40);
    ceilingGraphics.generateTexture('ceiling', width, 40);
    ceilingGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建地面（静态物理体）
    this.ground = this.physics.add.staticSprite(width / 2, height - 20, 'ground');
    this.ground.refreshBody();

    // 创建天花板（静态物理体）
    this.ceiling = this.physics.add.staticSprite(width / 2, 20, 'ceiling');
    this.ceiling.refreshBody();

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.ceiling);

    // 设置初始重力（向下）
    this.physics.world.gravity.y = this.gravityMagnitude;

    // 创建重力方向显示文本
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateGravityText();

    // 创建提示文本
    this.add.text(16, 60, 'Click Left Mouse Button to Toggle Gravity', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.toggleGravity();
      }
    });

    // 添加状态信息文本（用于验证）
    this.statusText = this.add.text(16, height - 40, '', {
      fontSize: '16px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  toggleGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'DOWN') {
      this.gravityDirection = 'UP';
      this.physics.world.gravity.y = -this.gravityMagnitude;
    } else {
      this.gravityDirection = 'DOWN';
      this.physics.world.gravity.y = this.gravityMagnitude;
    }

    // 更新显示文本
    this.updateGravityText();

    // 添加视觉反馈：玩家颜色变化
    const tint = this.gravityDirection === 'DOWN' ? 0x00ff00 : 0xff00ff;
    this.player.setTint(tint);
  }

  updateGravityText() {
    const arrow = this.gravityDirection === 'DOWN' ? '↓' : '↑';
    this.gravityText.setText(`Gravity: ${arrow} ${this.gravityDirection} (${this.gravityMagnitude})`);
  }

  update(time, delta) {
    // 更新状态信息（可验证的状态信号）
    const velocityY = Math.round(this.player.body.velocity.y);
    const posY = Math.round(this.player.y);
    this.statusText.setText(
      `Status - Direction: ${this.gravityDirection} | ` +
      `Velocity Y: ${velocityY} | Position Y: ${posY}`
    );

    // 根据重力方向调整玩家朝向（视觉反馈）
    if (this.gravityDirection === 'UP') {
      this.player.setFlipY(true);
    } else {
      this.player.setFlipY(false);
    }

    // 边界检测（额外保护，虽然已经设置了 collideWorldBounds）
    if (this.player.y < 50 && this.gravityDirection === 'UP') {
      this.player.body.velocity.y = Math.max(this.player.body.velocity.y, 0);
    }
    if (this.player.y > this.cameras.main.height - 50 && this.gravityDirection === 'DOWN') {
      this.player.body.velocity.y = Math.min(this.player.body.velocity.y, 0);
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
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: GravityScene
};

const game = new Phaser.Game(config);