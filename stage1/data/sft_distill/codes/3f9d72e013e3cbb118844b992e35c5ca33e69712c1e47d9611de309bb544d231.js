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
const MAX_CIRCLES = 3;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建橙色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  graphics.generateTexture('orangeCircle', 50, 50);
  graphics.destroy();

  // 创建定时器事件，每2.5秒触发一次
  timerEvent = this.time.addEvent({
    delay: 2500, // 2.5秒 = 2500毫秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true
  });
}

function spawnCircle() {
  // 检查是否已经生成了3个圆形
  if (circleCount >= MAX_CIRCLES) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
    }
    return;
  }

  // 生成随机位置（确保圆形完全在画布内）
  const x = Phaser.Math.Between(25, 775); // 留出圆形半径的边距
  const y = Phaser.Math.Between(25, 575);

  // 创建橙色圆形精灵
  const circle = this.add.sprite(x, y, 'orangeCircle');
  
  // 增加计数器
  circleCount++;
  
  console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);