class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // 状态信号：当前重力方向
    this.gravityValue = 600; // 状态信号：重力大小
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（使用Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（物理对象）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);

    // 设置初始重力（向下）
    this.physics.world.gravity.y = this.gravityValue;

    // 创建地面和天花板（用于碰撞）
    const ground = this.add.graphics();
    ground.fillStyle(0x8b4513, 1);
    ground.fillRect(0, 580, 800, 20);
    
    const ceiling = this.add.graphics();
    ceiling.fillStyle(0x8b4513, 1);
    ceiling.fillRect(0, 0, 800, 20);

    // 创建静态物理体作为边界
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 590, null).setSize(800, 20).refreshBody();
    
    this.ceiling = this.physics.add.staticGroup();
    this.ceiling.create(400, 10, null).setSize(800, 20).refreshBody();

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.ceiling);

    // 创建信息文本
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateInfoText();

    // 创建提示文本
    this.add.text(400, 300, 'Click to toggle gravity', {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.toggleGravity();
      }
    });

    // 添加键盘支持（空格键也可切换）
    this.input.keyboard.on('keydown-SPACE', () => {
      this.toggleGravity();
    });
  }

  toggleGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'DOWN') {
      this.gravityDirection = 'UP';
      this.physics.world.gravity.y = -this.gravityValue;
    } else {
      this.gravityDirection = 'DOWN';
      this.physics.world.gravity.y = this.gravityValue;
    }

    // 更新显示文本
    this.updateInfoText();

    // 添加视觉反馈：玩家颜色变化
    const color = this.gravityDirection === 'DOWN' ? 0x00ff00 : 0xff0000;
    const tempGraphics = this.add.graphics();
    tempGraphics.fillStyle(color, 1);
    tempGraphics.fillCircle(16, 16, 16);
    tempGraphics.generateTexture('player', 32, 32);
    tempGraphics.destroy();
    this.player.setTexture('player');
  }

  updateInfoText() {
    this.infoText.setText([
      `Gravity Direction: ${this.gravityDirection}`,
      `Gravity Value: ${Math.abs(this.physics.world.gravity.y)}`,
      `Player Y: ${Math.round(this.player.y)}`,
      `Player Velocity Y: ${Math.round(this.player.body.velocity.y)}`
    ]);
  }

  update(time, delta) {
    // 每帧更新信息文本
    this.updateInfoText();

    // 添加简单的水平移动控制（可选）
    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }
  }
}

// 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);