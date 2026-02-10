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
const MAX_ELLIPSES = 12;
let timerEvent = null;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 重置计数器
  ellipseCount = 0;
  
  // 添加说明文本
  this.add.text(10, 10, '每隔4秒生成一个粉色椭圆，最多12个', {
    fontSize: '18px',
    color: '#ffffff'
  });
  
  // 显示当前椭圆数量的文本
  const countText = this.add.text(10, 40, `椭圆数量: ${ellipseCount}/${MAX_ELLIPSES}`, {
    fontSize: '16px',
    color: '#ffff00'
  });
  
  // 创建定时器事件，每4秒触发一次
  timerEvent = this.time.addEvent({
    delay: 4000,                    // 4秒 = 4000毫秒
    callback: spawnEllipse,         // 回调函数
    callbackScope: this,            // 回调函数的作用域
    args: [countText],              // 传递文本对象用于更新
    loop: true,                     // 循环执行
    startAt: 0                      // 立即开始第一次
  });
  
  // 立即生成第一个椭圆
  spawnEllipse.call(this, countText);
}

function spawnEllipse(countText) {
  // 检查是否已达到最大数量
  if (ellipseCount >= MAX_ELLIPSES) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    
    // 显示完成提示
    this.add.text(400, 300, '已生成12个椭圆！', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    return;
  }
  
  // 生成随机位置
  // 确保椭圆完全在画布内（考虑椭圆半径）
  const radiusX = 30 + Math.random() * 20; // 30-50
  const radiusY = 20 + Math.random() * 15; // 20-35
  const x = radiusX + Math.random() * (800 - radiusX * 2);
  const y = radiusY + Math.random() * (600 - radiusY * 2);
  
  // 创建 Graphics 对象绘制粉色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色 (Hot Pink)
  graphics.fillEllipse(x, y, radiusX, radiusY);
  
  // 可选：添加边框使椭圆更明显
  graphics.lineStyle(2, 0xffffff, 0.8);
  graphics.strokeEllipse(x, y, radiusX, radiusY);
  
  // 增加计数
  ellipseCount++;
  
  // 更新计数文本
  countText.setText(`椭圆数量: ${ellipseCount}/${MAX_ELLIPSES}`);
  
  // 添加生成动画效果（可选）
  graphics.setAlpha(0);
  this.tweens.add({
    targets: graphics,
    alpha: 1,
    duration: 500,
    ease: 'Power2'
  });
}

new Phaser.Game(config);