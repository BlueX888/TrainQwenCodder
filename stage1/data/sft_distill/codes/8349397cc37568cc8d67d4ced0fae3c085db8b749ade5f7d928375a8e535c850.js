const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let star;
let pointer;
const FOLLOW_SPEED = 360; // 每秒移动的像素数

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建粉色星形纹理
  const graphics = this.add.graphics();
  
  // 绘制五角星
  const starPoints = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = 40 + Math.cos(angle) * radius;
    const y = 40 + Math.sin(angle) * radius;
    starPoints.push(x, y);
  }
  
  // 填充粉色
  graphics.fillStyle(0xff69b4, 1);
  graphics.beginPath();
  graphics.moveTo(starPoints[0], starPoints[1]);
  for (let i = 2; i < starPoints.length; i += 2) {
    graphics.lineTo(starPoints[i], starPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('pinkStar', 80, 80);
  graphics.destroy();
  
  // 创建星形精灵
  star = this.add.sprite(400, 300, 'pinkStar');
  
  // 获取指针引用
  pointer = this.input.activePointer;
  
  // 添加提示文字
  this.add.text(10, 10, 'Move your mouse to see the pink star follow!', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算星形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    star.x,
    star.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离足够近，就不移动（避免抖动）
  if (distance < 2) {
    return;
  }
  
  // 计算移动方向角度
  const angle = Phaser.Math.Angle.Between(
    star.x,
    star.y,
    pointer.x,
    pointer.y
  );
  
  // 计算本帧应该移动的距离（速度 * 时间）
  const moveDistance = Math.min(FOLLOW_SPEED * (delta / 1000), distance);
  
  // 根据角度和距离更新位置
  star.x += Math.cos(angle) * moveDistance;
  star.y += Math.sin(angle) * moveDistance;
  
  // 可选：让星形旋转增加视觉效果
  star.rotation += 0.02;
}

new Phaser.Game(config);