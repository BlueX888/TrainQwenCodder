class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.triangleCount = 0;
    this.maxTriangles = 5;
    this.timerEvent = null;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 使用 Graphics 创建粉色三角形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    
    // 绘制三角形（等边三角形）
    graphics.beginPath();
    graphics.moveTo(0, -30);  // 顶点
    graphics.lineTo(-30, 30); // 左下
    graphics.lineTo(30, 30);  // 右下
    graphics.closePath();
    graphics.fillPath();
    
    // 生成纹理
    graphics.generateTexture('pinkTriangle', 60, 60);
    graphics.destroy();

    // 创建定时器事件，每3秒触发一次
    this.timerEvent = this.time.addEvent({
      delay: 3000,              // 3秒
      callback: this.spawnTriangle,
      callbackScope: this,
      loop: true                // 循环执行
    });

    // 添加文本提示
    this.add.text(10, 10, '每3秒生成一个粉色三角形（最多5个）', {
      fontSize: '16px',
      color: '#ffffff'
    });

    this.countText = this.add.text(10, 35, `已生成: 0/${this.maxTriangles}`, {
      fontSize: '16px',
      color: '#ffffff'
    });
  }

  spawnTriangle() {
    // 检查是否已达到最大数量
    if (this.triangleCount >= this.maxTriangles) {
      this.timerEvent.remove(); // 停止定时器
      this.add.text(10, 60, '已达到最大数量！', {
        fontSize: '16px',
        color: '#ffff00'
      });
      return;
    }

    // 生成随机位置（避免边缘）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(100, 550);

    // 创建三角形精灵
    const triangle = this.add.image(x, y, 'pinkTriangle');
    
    // 添加简单的缩放动画效果
    triangle.setScale(0);
    this.tweens.add({
      targets: triangle,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // 增加计数
    this.triangleCount++;
    this.countText.setText(`已生成: ${this.triangleCount}/${this.maxTriangles}`);

    console.log(`生成第 ${this.triangleCount} 个三角形，位置: (${x}, ${y})`);
  }

  update(time, delta) {
    // 本例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);