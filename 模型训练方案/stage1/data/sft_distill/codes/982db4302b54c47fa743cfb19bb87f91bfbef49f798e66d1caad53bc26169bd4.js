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

let circleCount = 0;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 生成白色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(20, 20, 20); // 在 (20, 20) 位置绘制半径为 20 的圆
  graphics.generateTexture('whiteCircle', 40, 40);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
  
  // 重置计数器
  circleCount = 0;
  
  // 创建定时器事件，每 0.5 秒触发一次
  timerEvent = this.time.addEvent({
    delay: 500, // 0.5 秒 = 500 毫秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true
  });
}

function spawnCircle() {
  // 检查是否已经生成了 8 个圆形
  if (circleCount >= 8) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }
  
  // 生成随机位置
  // 确保圆形完全在画布内（考虑半径 20）
  const x = Phaser.Math.Between(20, 780);
  const y = Phaser.Math.Between(20, 580);
  
  // 创建白色圆形精灵
  const circle = this.add.image(x, y, 'whiteCircle');
  
  // 增加计数
  circleCount++;
  
  console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);