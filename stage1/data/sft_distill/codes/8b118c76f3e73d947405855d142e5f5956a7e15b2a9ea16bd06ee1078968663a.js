class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // 状态信号：当前重力方向
    this.gravityValue = 300;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（使用 Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(16, 10, 4); // 眼睛标记方向
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);

    // 设置初始重力（向下）
    this.physics.world.gravity.y = this.gravityValue;

    // 创建地面和天花板（用于碰撞）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 560, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();

    this.ground = this.physics.add.staticSprite(400, 580, 'ground');
    
    const ceilingGraphics = this.add.graphics();
    ceilingGraphics.fillStyle(0x4169e1, 1);
    ceilingGraphics.fillRect(0, 0, 800, 40);
    ceilingGraphics.generateTexture('ceiling', 800, 40);
    ceilingGraphics.destroy();

    this.ceiling = this.physics.add.staticSprite(400, 20, 'ceiling');

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.ceiling);

    // 创建状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 创建提示文本
    this.add.text(400, 300, 'Right Click to Toggle Gravity', {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.toggleGravity();
      }
    });

    // 添加键盘左右移动控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建重力方向指示箭头
    this.createGravityArrow();
  }

  toggleGravity() {
    if (this.gravityDirection === 'DOWN') {
      // 切换到向上
      this.gravityDirection = 'UP';
      this.physics.world.gravity.y = -this.gravityValue;
      this.player.setFlipY(true);
    } else {
      // 切换到向下
      this.gravityDirection = 'DOWN';
      this.physics.world.gravity.y = this.gravityValue;
      this.player.setFlipY(false);
    }
    
    this.updateStatusText();
    this.updateGravityArrow();
  }

  updateStatusText() {
    this.statusText.setText(
      `Gravity: ${this.gravityDirection}\n` +
      `Value: ${Math.abs(this.physics.world.gravity.y)}\n` +
      `Player Y: ${Math.round(this.player.y)}`
    );
  }

  createGravityArrow() {
    const arrowGraphics = this.add.graphics();
    arrowGraphics.lineStyle(4, 0xff0000, 1);
    arrowGraphics.fillStyle(0xff0000, 1);
    
    // 绘制箭头主体
    arrowGraphics.lineBetween(0, -20, 0, 20);
    // 绘制箭头头部（向下）
    arrowGraphics.fillTriangle(-8, 15, 8, 15, 0, 25);
    
    arrowGraphics.generateTexture('arrowDown', 20, 50);
    arrowGraphics.clear();
    
    // 绘制向上箭头
    arrowGraphics.lineStyle(4, 0xff0000, 1);
    arrowGraphics.fillStyle(0xff0000, 1);
    arrowGraphics.lineBetween(0, -20, 0, 20);
    arrowGraphics.fillTriangle(-8, -15, 8, -15, 0, -25);
    
    arrowGraphics.generateTexture('arrowUp', 20, 50);
    arrowGraphics.destroy();

    this.gravityArrow = this.add.image(750, 300, 'arrowDown');
    this.gravityArrow.setScale(2);
  }

  updateGravityArrow() {
    if (this.gravityDirection === 'DOWN') {
      this.gravityArrow.setTexture('arrowDown');
    } else {
      this.gravityArrow.setTexture('arrowUp');
    }
  }

  update(time, delta) {
    // 更新状态文本
    this.updateStatusText();

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 确保玩家不会超出边界
    if (this.player.y < 50) {
      this.player.y = 50;
      this.player.setVelocityY(0);
    }
    if (this.player.y > 550) {
      this.player.y = 550;
      this.player.setVelocityY(0);
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
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);