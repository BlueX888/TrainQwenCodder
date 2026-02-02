class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.triangleCount = 0;
    this.maxTriangles = 5;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 使用Graphics创建粉色三角形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    
    // 绘制一个等边三角形（顶点坐标）
    graphics.fillTriangle(
      32, 10,   // 顶部顶点
      10, 54,   // 左下顶点
      54, 54    // 右下顶点
    );
    
    // 生成纹理
    graphics.generateTexture('pinkTriangle', 64, 64);
    graphics.destroy();

    // 创建定时器事件，每3秒触发一次
    this.timerEvent = this.time.addEvent({
      delay: 3000,           // 3秒
      callback: this.spawnTriangle,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 添加文本提示
    this.infoText = this.add.text(10, 10, 'Triangles: 0/5', {
      fontSize: '20px',
      color: '#ffffff'
    });
  }

  spawnTriangle() {
    // 检查是否已达到最大数量
    if (this.triangleCount >= this.maxTriangles) {
      this.timerEvent.remove(); // 停止定时器
      this.infoText.setText('Triangles: 5/5 (Complete!)');
      return;
    }

    // 生成随机位置（确保三角形在屏幕内）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);

    // 创建三角形精灵
    const triangle = this.add.image(x, y, 'pinkTriangle');
    
    // 添加一些视觉效果：缩放动画
    triangle.setScale(0);
    this.tweens.add({
      targets: triangle,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // 更新计数
    this.triangleCount++;
    this.infoText.setText(`Triangles: ${this.triangleCount}/5`);
  }

  update(time, delta) {
    // 每帧更新逻辑（本例中不需要）
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);