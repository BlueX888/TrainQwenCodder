const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

let circleCount = 0;
const MAX_CIRCLES = 15;
let timerEvent;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 使用 Graphics 创建橙色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8800, 1); // 橙色
  graphics.fillCircle(20, 20, 20); // 绘制半径为20的圆
  graphics.generateTexture('orangeCircle', 40, 40);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建定时器，每1秒执行一次
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true
  });
}

function spawnCircle() {
  // 检查是否已达到最大数量
  if (circleCount >= MAX_CIRCLES) {
    timerEvent.remove(); // 停止定时器
    console.log('已生成15个圆形，停止生成');
    return;
  }

  // 生成随机位置（考虑圆形半径，避免超出边界）
  const x = Phaser.Math.Between(20, 780);
  const y = Phaser.Math.Between(20, 580);

  // 添加圆形精灵
  const circle = this.add.image(x, y, 'orangeCircle');
  
  // 增加计数
  circleCount++;
  
  console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);