class GravityGameScene extends Phaser.Scene {
  constructor() {
    super('GravityGameScene');
    this.gravityDirection = 'DOWN'; // 状态信号：当前重力方向
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（使用 Graphics 绘制蓝色矩形）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('playerTex', 40, 40);
    graphics.destroy();

    // 创建物理精灵玩家
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(true); // 与世界边界碰撞
    this.player.setBounce(0.3); // 添加弹性

    // 创建地面（使用 Graphics 绘制绿色矩形）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00ff00, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('groundTex', 800, 40);
    groundGraphics.destroy();

    // 创建地面物理对象（底部）
    this.ground = this.physics.add.staticSprite(400, 580, 'groundTex');
    
    // 创建天花板物理对象（顶部）
    const ceilingGraphics = this.add.graphics();
    ceilingGraphics.fillStyle(0xff6600, 1);
    ceilingGraphics.fillRect(0, 0, 800, 40);
    ceilingGraphics.generateTexture('ceilingTex', 800, 40);
    ceilingGraphics.destroy();
    
    this.ceiling = this.physics.add.staticSprite(400, 20, 'ceilingTex');

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.ceiling);

    // 创建显示重力方向的文本
    this.gravityText = this.add.text(16, 16, 'Gravity: DOWN', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建提示文本
    this.add.text(16, 560, 'Click Left Mouse Button to Toggle Gravity', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.toggleGravity();
      }
    });

    // 初始化重力方向
    this.updateGravityDisplay();
  }

  toggleGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'DOWN') {
      this.gravityDirection = 'UP';
      this.physics.world.gravity.y = -800; // 重力向上
    } else {
      this.gravityDirection = 'DOWN';
      this.physics.world.gravity.y = 800; // 重力向下
    }

    // 更新显示
    this.updateGravityDisplay();

    // 给玩家一个小的初始速度，使效果更明显
    if (this.gravityDirection === 'UP') {
      this.player.setVelocityY(-100);
    } else {
      this.player.setVelocityY(100);
    }

    // 输出到控制台用于调试
    console.log('Gravity switched to:', this.gravityDirection, 'Value:', this.physics.world.gravity.y);
  }

  updateGravityDisplay() {
    // 更新文本显示
    this.gravityText.setText(`Gravity: ${this.gravityDirection}`);
    
    // 根据重力方向改变文本颜色
    if (this.gravityDirection === 'UP') {
      this.gravityText.setColor('#ff00ff');
    } else {
      this.gravityText.setColor('#00ffff');
    }
  }

  update(time, delta) {
    // 可选：限制玩家的最大速度
    const maxVelocity = 600;
    if (Math.abs(this.player.body.velocity.y) > maxVelocity) {
      this.player.setVelocityY(Math.sign(this.player.body.velocity.y) * maxVelocity);
    }

    // 可选：添加视觉反馈 - 根据重力方向旋转玩家
    if (this.gravityDirection === 'UP') {
      this.player.setAngle(180);
    } else {
      this.player.setAngle(0);
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 }, // 初始重力向下，大小 800
      debug: false
    }
  },
  scene: GravityGameScene
};

// 创建游戏实例
new Phaser.Game(config);