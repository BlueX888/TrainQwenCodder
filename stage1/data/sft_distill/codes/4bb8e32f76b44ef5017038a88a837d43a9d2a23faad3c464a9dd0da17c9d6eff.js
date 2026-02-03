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
  // 无需加载外部资源
}

function create() {
  // 使用 Graphics 生成橙色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillCircle(25, 25, 25); // 绘制半径为25的圆
  graphics.generateTexture('orangeCircle', 50, 50);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 创建定时器事件，每2.5秒触发一次
  timerEvent = this.time.addEvent({
    delay: 2500, // 2.5秒 = 2500毫秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true
  });
}

function spawnCircle() {
  // 检查是否已生成3个圆形
  if (circleCount >= 3) {
    // 达到最大数量，移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }

  // 生成随机位置（确保圆形完全在画布内）
  const radius = 25;
  const x = Phaser.Math.Between(radius, 800 - radius);
  const y = Phaser.Math.Between(radius, 600 - radius);

  // 在随机位置创建橙色圆形
  const circle = this.add.image(x, y, 'orangeCircle');
  
  // 增加计数
  circleCount++;
  
  console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);