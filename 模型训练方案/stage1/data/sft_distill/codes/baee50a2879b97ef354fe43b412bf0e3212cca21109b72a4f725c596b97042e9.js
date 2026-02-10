const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

let circleCount = 0;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建橙色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  graphics.fillCircle(25, 25, 25); // 半径25的圆
  graphics.generateTexture('orangeCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象释放资源

  // 创建定时器事件，每2.5秒执行一次
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
    // 达到上限，移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }

  // 生成随机位置（确保圆形完全在画布内）
  const x = Phaser.Math.Between(25, 775); // 留出25像素边距
  const y = Phaser.Math.Between(25, 575);

  // 创建圆形精灵
  const circle = this.add.sprite(x, y, 'orangeCircle');
  
  // 增加计数
  circleCount++;

  console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);