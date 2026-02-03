const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

let starCount = 0;
const MAX_STARS = 12;
let timerEvent;

function preload() {
  // 使用 Graphics 创建星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制星形路径
  const points = [];
  const outerRadius = 20;
  const innerRadius = 10;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: 25 + Math.cos(angle) * radius,
      y: 25 + Math.sin(angle) * radius
    });
  }
  
  graphics.fillPoints(points, true);
  graphics.generateTexture('star', 50, 50);
  graphics.destroy();
}

function create() {
  // 添加背景色以便看清星形
  this.cameras.main.setBackgroundColor('#1a1a1a');
  
  // 创建定时器事件，每2秒触发一次
  timerEvent = this.time.addEvent({
    delay: 2000, // 2秒
    callback: spawnStar,
    callbackScope: this,
    loop: true
  });
  
  // 立即生成第一个星形
  spawnStar.call(this);
}

function spawnStar() {
  if (starCount >= MAX_STARS) {
    // 达到最大数量，移除定时器
    if (timerEvent) {
      timerEvent.remove();
      console.log('已生成12个星形，停止生成');
    }
    return;
  }
  
  // 生成随机位置（留出边距避免星形被裁切）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  // 添加星形精灵
  const star = this.add.image(x, y, 'star');
  
  // 增加计数
  starCount++;
  
  console.log(`生成第 ${starCount} 个星形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);