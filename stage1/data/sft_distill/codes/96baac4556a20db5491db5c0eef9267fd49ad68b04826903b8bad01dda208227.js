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

// 圆形计数器
let circleCount = 0;
const MAX_CIRCLES = 15;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建紫色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932cc, 1); // 紫色
  graphics.fillCircle(20, 20, 20); // 圆心(20,20)，半径20
  graphics.generateTexture('purpleCircle', 40, 40);
  graphics.destroy(); // 销毁临时 graphics 对象
  
  // 创建定时器，每1秒执行一次
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒 = 1000毫秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true // 循环执行
  });
}

function spawnCircle() {
  // 检查是否已达到最大数量
  if (circleCount >= MAX_CIRCLES) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    console.log('已生成15个圆形，停止生成');
    return;
  }
  
  // 生成随机位置（确保圆形完全在画布内）
  const radius = 20;
  const randomX = Phaser.Math.Between(radius, 800 - radius);
  const randomY = Phaser.Math.Between(radius, 600 - radius);
  
  // 在随机位置添加紫色圆形
  this.add.image(randomX, randomY, 'purpleCircle');
  
  // 增加计数器
  circleCount++;
  console.log(`生成第 ${circleCount} 个圆形，位置: (${randomX}, ${randomY})`);
}

// 启动游戏
new Phaser.Game(config);