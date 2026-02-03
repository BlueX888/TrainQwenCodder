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
  // 无需预加载外部资源
}

function create() {
  // 初始化椭圆计数器
  ellipseCount = 0;
  
  // 创建定时器，每3秒触发一次
  timerEvent = this.time.addEvent({
    delay: 3000,              // 3秒
    callback: spawnEllipse,   // 回调函数
    callbackScope: this,      // 回调作用域
    loop: true                // 循环执行
  });
  
  // 显示提示文本
  this.add.text(10, 10, '每3秒生成一个灰色椭圆，最多5个', {
    fontSize: '18px',
    color: '#ffffff'
  });
  
  // 显示计数文本
  this.countText = this.add.text(10, 40, '已生成: 0/5', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function spawnEllipse() {
  // 检查是否已达到最大数量
  if (ellipseCount >= 5) {
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    
    // 更新提示文本
    this.countText.setText('已生成: 5/5 (完成)');
    return;
  }
  
  // 生成随机位置
  const x = Phaser.Math.Between(100, 700);
  const y = Phaser.Math.Between(100, 500);
  
  // 生成随机椭圆尺寸
  const radiusX = Phaser.Math.Between(30, 60);
  const radiusY = Phaser.Math.Between(20, 50);
  
  // 创建 Graphics 对象绘制椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(x, y, radiusX, radiusY);
  
  // 增加计数
  ellipseCount++;
  
  // 更新计数文本
  this.countText.setText(`已生成: ${ellipseCount}/5`);
  
  // 添加淡入效果
  graphics.setAlpha(0);
  this.tweens.add({
    targets: graphics,
    alpha: 1,
    duration: 500,
    ease: 'Power2'
  });
}

new Phaser.Game(config);