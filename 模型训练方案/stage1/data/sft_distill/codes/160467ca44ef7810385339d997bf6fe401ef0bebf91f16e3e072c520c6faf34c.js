class GravitySwitchScene extends Phaser.Scene {
  constructor() {
    super('GravitySwitchScene');
    this.gravityDirection = 'DOWN'; // 状态信号：当前重力方向
    this.switchCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 1. 程序化生成玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 2. 创建玩家精灵（物理对象）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);

    // 3. 设置初始重力方向（向下）
    this.physics.world.gravity.y = 800;
    this.gravityDirection = 'DOWN';

    // 4. 创建显示文本
    this.gravityText = this.add.text(20, 20, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.gravityText.setDepth(100);

    // 5. 创建提示文本
    this.add.text(20, 560, 'Click Left Mouse Button to Switch Gravity', {
      fontSize: '18px',
      fill: '#ffff00'
    });

    // 6. 状态显示文本
    this.statusText = this.add.text(600, 20, '', {
      fontSize: '18px',
      fill: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 7. 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.toggleGravity();
      }
    });

    // 8. 添加地板和天花板作为参考
    this.createBoundaryIndicators();

    // 9. 更新显示
    this.updateDisplay();
  }

  toggleGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'DOWN') {
      this.physics.world.gravity.y = -800;
      this.gravityDirection = 'UP';
    } else {
      this.physics.world.gravity.y = 800;
      this.gravityDirection = 'DOWN';
    }

    this.switchCount++;
    this.updateDisplay();

    // 视觉反馈：玩家颜色闪烁
    this.player.setTint(0xff0000);
    this.time.delayedCall(100, () => {
      this.player.clearTint();
    });
  }

  createBoundaryIndicators() {
    // 创建地板指示器
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0x666666, 1);
    floorGraphics.fillRect(0, 590, 800, 10);

    // 创建天花板指示器
    const ceilingGraphics = this.add.graphics();
    ceilingGraphics.fillStyle(0x666666, 1);
    ceilingGraphics.fillRect(0, 0, 800, 10);

    // 添加标签
    this.add.text(10, 595, 'FLOOR', {
      fontSize: '12px',
      fill: '#ffffff'
    });

    this.add.text(10, 0, 'CEILING', {
      fontSize: '12px',
      fill: '#ffffff'
    });
  }

  updateDisplay() {
    // 更新重力方向显示
    const gravityValue = this.physics.world.gravity.y;
    const arrow = this.gravityDirection === 'DOWN' ? '↓' : '↑';
    
    this.gravityText.setText([
      `Gravity Direction: ${this.gravityDirection} ${arrow}`,
      `Gravity Value: ${gravityValue}`
    ]);

    // 更新状态显示
    this.statusText.setText([
      `Switch Count: ${this.switchCount}`,
      `Player Y: ${Math.round(this.player.y)}`
    ]);
  }

  update(time, delta) {
    // 持续更新玩家位置显示
    if (this.player && this.statusText) {
      this.statusText.setText([
        `Switch Count: ${this.switchCount}`,
        `Player Y: ${Math.round(this.player.y)}`,
        `Velocity Y: ${Math.round(this.player.body.velocity.y)}`
      ]);
    }

    // 添加轻微的水平移动控制（可选）
    if (this.input.keyboard) {
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
      gravity: { y: 800 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravitySwitchScene
};

// 创建游戏实例
const game = new Phaser.Game(config);