const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let star;
let pointer;
const FOLLOW_SPEED = 360; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制五角星
  const points = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const centerX = 40;
  const centerY = 40;
  
  for (let i = 0; i < 5; i++) {
    // 外顶点
    const outerAngle = (i * 2 * Math.PI / 5) - Math.PI / 2;
    points.push(centerX + outerRadius * Math.cos(outerAngle));
    points.push(centerY + outerRadius * Math.sin(outerAngle));
    
    // 内顶点
    const innerAngle = ((i * 2 + 1) * Math.PI / 5) - Math.PI / 2;
    points.push(centerX + innerRadius * Math.cos(innerAngle));
    points.push(centerY + innerRadius * Math.sin(innerAngle));
  }
  
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 80, 80);
  graphics.destroy();
  
  // 创建星形精灵，初始位置在屏幕中心
  star = this.add.sprite(400, 300, 'starTexture');
  
  // 获取指针引用
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, '移动鼠标，星形会平滑跟随', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算星形到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    star.x,
    star.y,
    pointer.x,
    pointer.y
  );
  
  // 只有当距离大于1像素时才移动，避免抖动
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      star.x,
      star.y,
      pointer.x,
      pointer.y
    );
    
    // 计算本帧应该移动的距离（速度 * 时间）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      star.x = pointer.x;
      star.y = pointer.y;
    } else {
      // 根据角度和移动距离更新位置
      star.x += Math.cos(angle) * moveDistance;
      star.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);