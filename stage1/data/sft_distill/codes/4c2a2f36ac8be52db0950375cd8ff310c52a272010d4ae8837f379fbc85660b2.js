class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.gravityValue = 200;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（使用 Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('playerTex', 32, 32);
    graphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('groundTex', 800, 50);
    groundGraphics.destroy();

    // 创建天花板纹理
    const ceilingGraphics = this.add.graphics();
    ceilingGraphics.fillStyle(0x4169e1, 1);
    ceilingGraphics.fillRect(0, 0, 800, 50);
    ceilingGraphics.generateTexture('ceilingTex', 800, 50);
    ceilingGraphics.destroy();

    // 创建玩家精灵（物理对象）
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    
    // 初始设置向下的重力
    this.player.body.setGravityY(this.gravityValue);

    // 创建地面（静态物理对象）
    this.ground = this.physics.add.staticSprite(400, 575, 'groundTex');
    this.ground.refreshBody();

    // 创建天花板（静态物理对象）
    this.ceiling = this.physics.add.staticSprite(400, 25, 'ceilingTex');
    this.ceiling.refreshBody();

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.ceiling);

    // 创建重力方向显示文本
    this.gravityText = this.add.text(16, 16, 'Gravity: DOWN', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.gravityText.setDepth(100);

    // 创建提示文本
    this.hintText = this.add.text(400, 300, 'Click Left Mouse Button to Toggle Gravity', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.hintText.setOrigin(0.5);
    this.hintText.setDepth(100);

    // 3秒后隐藏提示文本
    this.time.delayedCall(3000, () => {
      this.hintText.setVisible(false);
    });

    // 添加鼠标左键点击事件监听
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.toggleGravity();
      }
    });

    // 添加状态信息文本（用于验证）
    this.statusText = this.add.text(16, 560, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
    this.statusText.setDepth(100);
  }

  toggleGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'down') {
      this.gravityDirection = 'up';
      this.player.body.setGravityY(-this.gravityValue);
      this.gravityText.setText('Gravity: UP');
      this.gravityText.setStyle({ color: '#00ffff' });
    } else {
      this.gravityDirection = 'down';
      this.player.body.setGravityY(this.gravityValue);
      this.gravityText.setText('Gravity: DOWN');
      this.gravityText.setStyle({ color: '#ffffff' });
    }

    // 给玩家一个小的初始速度，使重力切换更明显
    const impulse = this.gravityDirection === 'down' ? 50 : -50;
    this.player.setVelocityY(impulse);
  }

  update(time, delta) {
    // 更新状态信息（用于验证）
    const playerY = Math.round(this.player.y);
    const velocityY = Math.round(this.player.body.velocity.y);
    this.statusText.setText(
      `Status: Direction=${this.gravityDirection.toUpperCase()} | ` +
      `PlayerY=${playerY} | VelocityY=${velocityY}`
    );

    // 可选：添加左右移动控制
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

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 世界重力设为 0，通过 body 的重力控制
      debug: false
    }
  },
  scene: GravityScene
};

// 创建游戏实例
new Phaser.Game(config);