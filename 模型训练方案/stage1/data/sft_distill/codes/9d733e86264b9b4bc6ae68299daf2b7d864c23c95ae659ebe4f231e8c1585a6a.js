class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.diamondCount = 0;
    this.maxDiamonds = 3;
    this.timerEvent = null;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 使用 Graphics 创建菱形纹理
    this.createDiamondTexture();

    // 创建定时器，每1.5秒生成一个菱形
    this.timerEvent = this.time.addEvent({
      delay: 1500, // 1.5秒 = 1500毫秒
      callback: this.spawnDiamond,
      callbackScope: this,
      loop: true
    });

    // 添加提示文本
    this.add.text(10, 10, 'Spawning diamonds (max 3)...', {
      fontSize: '18px',
      color: '#ffffff'
    });
  }

  createDiamondTexture() {
    // 创建一个菱形形状的纹理
    const graphics = this.add.graphics();
    
    // 设置绿色填充
    graphics.fillStyle(0x00ff00, 1);
    
    // 绘制菱形（四个三角形或使用路径）
    const size = 40;
    const centerX = size / 2;
    const centerY = size / 2;
    
    graphics.beginPath();
    graphics.moveTo(centerX, 0); // 上顶点
    graphics.lineTo(size, centerY); // 右顶点
    graphics.lineTo(centerX, size); // 下顶点
    graphics.lineTo(0, centerY); // 左顶点
    graphics.closePath();
    graphics.fillPath();
    
    // 生成纹理
    graphics.generateTexture('diamond', size, size);
    
    // 销毁临时 graphics 对象
    graphics.destroy();
  }

  spawnDiamond() {
    // 检查是否达到最大数量
    if (this.diamondCount >= this.maxDiamonds) {
      // 停止定时器
      if (this.timerEvent) {
        this.timerEvent.remove();
        this.timerEvent = null;
      }
      
      // 添加完成提示
      this.add.text(10, 40, 'All diamonds spawned!', {
        fontSize: '18px',
        color: '#ffff00'
      });
      
      return;
    }

    // 生成随机位置（确保菱形完全在屏幕内）
    const margin = 40; // 菱形大小的一半加上边距
    const x = Phaser.Math.Between(margin, this.scale.width - margin);
    const y = Phaser.Math.Between(margin + 60, this.scale.height - margin);

    // 创建菱形精灵
    const diamond = this.add.sprite(x, y, 'diamond');
    
    // 添加一个简单的缩放动画效果
    this.tweens.add({
      targets: diamond,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    // 增加计数
    this.diamondCount++;
    
    console.log(`Diamond ${this.diamondCount} spawned at (${x}, ${y})`);
  }

  update(time, delta) {
    // 本例无需每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);