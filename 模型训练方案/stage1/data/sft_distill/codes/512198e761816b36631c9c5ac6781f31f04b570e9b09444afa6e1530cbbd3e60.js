class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.switchCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 使用 Graphics 生成玩家纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建玩家精灵（物理对象）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建地面和天花板（用于碰撞）
    const ground = this.add.rectangle(400, 580, 800, 40, 0x8b4513);
    this.physics.add.existing(ground, true); // 静态物理对象
    
    const ceiling = this.add.rectangle(400, 20, 800, 40, 0x4a4a4a);
    this.physics.add.existing(ceiling, true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.player, ceiling);

    // 创建显示文本
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.infoText = this.add.text(16, 56, '', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateGravityText();

    // 监听鼠标右键事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.toggleGravity();
      }
    });

    // 添加提示文本
    this.add.text(400, 300, 'Right Click to Toggle Gravity', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 15, y: 10 }
    }).setOrigin(0.5);

    // 启用右键菜单禁用（可选，提升体验）
    this.input.mouse.disableContextMenu();
  }

  toggleGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'down') {
      this.physics.world.gravity.y = -300;
      this.gravityDirection = 'up';
    } else {
      this.physics.world.gravity.y = 300;
      this.gravityDirection = 'down';
    }

    this.switchCount++;
    this.updateGravityText();

    // 添加视觉反馈
    this.cameras.main.shake(100, 0.005);
  }

  updateGravityText() {
    const arrow = this.gravityDirection === 'down' ? '↓' : '↑';
    const gravityValue = this.physics.world.gravity.y;
    
    this.gravityText.setText(
      `Gravity: ${arrow} ${this.gravityDirection.toUpperCase()} (${gravityValue})`
    );

    this.infoText.setText(
      `Switches: ${this.switchCount} | Player Y: ${Math.round(this.player.y)}`
    );
  }

  update(time, delta) {
    // 更新信息显示
    this.updateGravityText();

    // 添加简单的左右移动控制（可选）
    const cursors = this.input.keyboard.createCursorKeys();
    
    if (cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 限制玩家速度（防止过快）
    const maxVelocity = 500;
    if (Math.abs(this.player.body.velocity.y) > maxVelocity) {
      this.player.setVelocityY(
        Math.sign(this.player.body.velocity.y) * maxVelocity
      );
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
      gravity: { y: 300 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityScene
};

// 启动游戏
const game = new Phaser.Game(config);