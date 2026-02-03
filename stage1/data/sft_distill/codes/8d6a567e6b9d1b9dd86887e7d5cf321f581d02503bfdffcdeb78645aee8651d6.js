const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

let ellipseCount = 0;
let timerEvent = null;

function preload() {
  // 无需预加载资源
}

function create() {
  // 重置计数器
  ellipseCount = 0;
  
  // 创建定时器，每1.5秒生成一个椭圆
  timerEvent = this.time.addEvent({
    delay: 1500, // 1.5秒 = 1500毫秒
    callback: spawnEllipse,
    callbackScope: this,
    loop: true
  });
  
  // 添加文本提示
  this.add.text(10, 10, '椭圆计数: 0 / 15', {
    fontSize: '20px',
    color: '#ffffff'
  }).setName('counterText');
}

function spawnEllipse() {
  // 检查是否已达到最大数量
  if (ellipseCount >= 15) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }
  
  // 生成随机位置
  // 留出边距避免椭圆超出边界
  const margin = 50;
  const x = Phaser.Math.Between(margin, 800 - margin);
  const y = Phaser.Math.Between(margin, 600 - margin);
  
  // 生成随机大小的椭圆
  const radiusX = Phaser.Math.Between(20, 40);
  const radiusY = Phaser.Math.Between(15, 35);
  
  // 使用 Graphics 绘制白色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1); // 白色
  graphics.fillEllipse(x, y, radiusX, radiusY);
  
  // 方法二：也可以使用 Ellipse GameObject（注释备选方案）
  // const ellipse = this.add.ellipse(x, y, radiusX * 2, radiusY * 2, 0xffffff);
  
  // 增加计数
  ellipseCount++;
  
  // 更新计数文本
  const counterText = this.children.getByName('counterText');
  if (counterText) {
    counterText.setText(`椭圆计数: ${ellipseCount} / 15`);
  }
  
  // 如果达到15个，显示完成提示
  if (ellipseCount >= 15) {
    this.add.text(400, 300, '已生成15个椭圆！', {
      fontSize: '32px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
  }
}

new Phaser.Game(config);