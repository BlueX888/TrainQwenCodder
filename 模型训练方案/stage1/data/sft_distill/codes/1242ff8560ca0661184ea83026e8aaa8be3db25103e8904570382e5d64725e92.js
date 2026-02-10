class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.triangleCount = 0;
    this.maxTriangles = 15;
    this.timerEvent = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 创建蓝色三角形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1); // 蓝色
    
    // 绘制三角形路径
    graphics.beginPath();
    graphics.moveTo(0, -30);  // 顶点
    graphics.lineTo(-25, 25);  // 左下角
    graphics.lineTo(25, 25);   // 右下角
    graphics.closePath();
    graphics.fillPath();
    
    // 生成纹理
    graphics.generateTexture('blueTriangle', 50, 55);
    graphics.destroy();

    // 创建定时器，每4秒执行一次
    this.timerEvent = this.time.addEvent({
      delay: 4000,           // 4秒
      callback: this.spawnTriangle,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 立即生成第一个三角形
    this.spawnTriangle();

    // 显示提示文本
    this.add.text(10, 10, 'Triangles: 0/15', {
      fontSize: '20px',
      color: '#ffffff'
    }).setName('counterText');
  }

  spawnTriangle() {
    // 检查是否已达到最大数量
    if (this.triangleCount >= this.maxTriangles) {
      this.timerEvent.remove(); // 停止定时器
      console.log('已生成15个三角形，停止生成');
      return;
    }

    // 生成随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);

    // 创建三角形精灵
    const triangle = this.add.image(x, y, 'blueTriangle');
    
    // 增加计数
    this.triangleCount++;

    // 更新计数文本
    const counterText = this.children.getByName('counterText');
    if (counterText) {
      counterText.setText(`Triangles: ${this.triangleCount}/15`);
    }

    console.log(`生成第 ${this.triangleCount} 个三角形，位置: (${x}, ${y})`);
  }

  update(time, delta) {
    // 无需每帧更新逻辑
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