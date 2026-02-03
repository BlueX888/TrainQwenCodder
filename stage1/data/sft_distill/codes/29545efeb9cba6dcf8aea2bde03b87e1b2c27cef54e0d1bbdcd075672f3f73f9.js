class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.switchCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（使用 Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, width, 30);
    groundGraphics.generateTexture('ground', width, 30);
    groundGraphics.destroy();

    // 创建天花板纹理
    const ceilingGraphics = this.add.graphics();
    ceilingGraphics.fillStyle(0x444444, 1);
    ceilingGraphics.fillRect(0, 0, width, 30);
    ceilingGraphics.generateTexture('ceiling', width, 30);
    ceilingGraphics.destroy();

    // 创建地面和天花板（静态物理对象）
    this.ground = this.physics.add.staticSprite(width / 2, height - 15, 'ground');
    this.ceiling = this.physics.add.staticSprite(width / 2, 15, 'ceiling');

    // 创建玩家精灵
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(false); // 禁用世界边界，使用自定义碰撞

    // 添加玩家与地面/天花板的碰撞
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.ceiling);

    // 设置初始重力（向下）
    this.physics.world.gravity.y = 300;
    this.physics.world.gravity.x = 0;

    // 创建状态显示文本
    this.gravityText = this.add.text(20, 20, '', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.switchCountText = this.add.text(20, 60, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(width / 2, 100, '点击鼠标左键切换重力方向', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.toggleGravity();
      }
    });

    // 初始化显示
    this.updateGravityDisplay();
  }

  toggleGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'down') {
      // 切换到向上
      this.physics.world.gravity.y = -300;
      this.gravityDirection = 'up';
    } else {
      // 切换到向下
      this.physics.world.gravity.y = 300;
      this.gravityDirection = 'down';
    }

    // 增加切换计数
    this.switchCount++;

    // 更新显示
    this.updateGravityDisplay();

    // 视觉反馈：玩家闪烁
    this.player.setTint(0xff0000);
    this.time.delayedCall(100, () => {
      this.player.clearTint();
    });
  }

  updateGravityDisplay() {
    // 更新重力方向文本
    const arrow = this.gravityDirection === 'down' ? '↓' : '↑';
    this.gravityText.setText(`重力方向: ${arrow} ${this.gravityDirection.toUpperCase()}`);

    // 更新切换次数
    this.switchCountText.setText(`切换次数: ${this.switchCount}`);
  }

  update(time, delta) {
    const { width, height } = this.cameras.main;

    // 保持玩家在屏幕内（如果超出边界则重置位置）
    if (this.player.y < -50) {
      this.player.setPosition(width / 2, height - 100);
      this.player.setVelocity(0, 0);
    } else if (this.player.y > height + 50) {
      this.player.setPosition(width / 2, 100);
      this.player.setVelocity(0, 0);
    }

    // 添加轻微的水平控制（可选，让玩家能左右移动）
    if (this.input.keyboard) {
      const cursors = this.input.keyboard.createCursorKeys();
      
      if (cursors.left.isDown) {
        this.player.setVelocityX(-150);
      } else if (cursors.right.isDown) {
        this.player.setVelocityX(150);
      } else {
        // 应用摩擦力
        this.player.setVelocityX(this.player.body.velocity.x * 0.95);
      }
    }

    // 保持玩家水平位置在屏幕内
    if (this.player.x < 20) {
      this.player.setX(20);
    } else if (this.player.x > width - 20) {
      this.player.setX(width - 20);
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

// 创建游戏实例
new Phaser.Game(config);