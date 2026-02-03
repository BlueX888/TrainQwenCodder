class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // 状态信号：当前重力方向
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 程序化生成玩家纹理（蓝色圆形）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x3498db, 1);
    graphics.fillCircle(25, 25, 25);
    graphics.generateTexture('player', 50, 50);
    graphics.destroy();

    // 创建玩家精灵（带物理属性）
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3); // 添加弹性效果

    // 初始重力设置
    this.physics.world.gravity.y = 300;

    // 创建重力方向显示文本
    this.gravityText = this.add.text(16, 16, 'Gravity: DOWN', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.gravityText.setDepth(1);

    // 创建提示文本
    this.add.text(width / 2, height - 30, 'Click Left Mouse Button to Toggle Gravity', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 添加视觉指示器（箭头）
    this.arrowGraphics = this.add.graphics();
    this.updateArrow();

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.toggleGravity();
      }
    });

    // 添加调试信息显示
    this.debugText = this.add.text(16, 50, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  toggleGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'DOWN') {
      this.physics.world.gravity.y = -300;
      this.gravityDirection = 'UP';
      this.gravityText.setText('Gravity: UP');
    } else {
      this.physics.world.gravity.y = 300;
      this.gravityDirection = 'DOWN';
      this.gravityText.setText('Gravity: DOWN');
    }

    // 更新箭头指示器
    this.updateArrow();

    // 给玩家一个小的初始速度，使效果更明显
    if (this.gravityDirection === 'UP') {
      this.player.setVelocityY(-50);
    } else {
      this.player.setVelocityY(50);
    }
  }

  updateArrow() {
    // 清除之前的箭头
    this.arrowGraphics.clear();
    
    // 绘制箭头指示重力方向
    const arrowX = this.cameras.main.width - 50;
    const arrowY = 50;
    
    this.arrowGraphics.lineStyle(4, 0xffff00, 1);
    this.arrowGraphics.fillStyle(0xffff00, 1);

    if (this.gravityDirection === 'DOWN') {
      // 向下箭头
      this.arrowGraphics.beginPath();
      this.arrowGraphics.moveTo(arrowX, arrowY);
      this.arrowGraphics.lineTo(arrowX, arrowY + 40);
      this.arrowGraphics.strokePath();
      
      // 箭头头部
      this.arrowGraphics.fillTriangle(
        arrowX, arrowY + 40,
        arrowX - 10, arrowY + 30,
        arrowX + 10, arrowY + 30
      );
    } else {
      // 向上箭头
      this.arrowGraphics.beginPath();
      this.arrowGraphics.moveTo(arrowX, arrowY + 40);
      this.arrowGraphics.lineTo(arrowX, arrowY);
      this.arrowGraphics.strokePath();
      
      // 箭头头部
      this.arrowGraphics.fillTriangle(
        arrowX, arrowY,
        arrowX - 10, arrowY + 10,
        arrowX + 10, arrowY + 10
      );
    }
  }

  update(time, delta) {
    // 更新调试信息
    this.debugText.setText([
      `Player Y: ${Math.round(this.player.y)}`,
      `Velocity Y: ${Math.round(this.player.body.velocity.y)}`,
      `Gravity: ${this.physics.world.gravity.y}`
    ]);

    // 可选：添加简单的水平控制
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
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GravityScene
};

// 创建游戏实例
const game = new Phaser.Game(config);