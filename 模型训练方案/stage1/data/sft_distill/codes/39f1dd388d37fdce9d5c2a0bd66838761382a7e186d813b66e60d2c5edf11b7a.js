const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
let pointer;

function preload() {
  // 使用 Graphics 绘制六边形并生成纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制蓝色六边形
  graphics.fillStyle(0x0066ff, 1);
  graphics.lineStyle(2, 0x0044cc, 1);
  
  const radius = 30;
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  
  graphics.beginPath();
  for (let i = 0; i < sides; i++) {
    const x = radius + Math.cos(angle * i) * radius;
    const y = radius + Math.sin(angle * i) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
}

function create() {
  // 创建六边形精灵，初始位置在屏幕中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 获取指针引用
  pointer = this.input.activePointer;
  
  // 添加提示文本
  const text = this.add.text(10, 10, '移动鼠标，六边形会跟随', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 获取鼠标位置
  const mouseX = pointer.x;
  const mouseY = pointer.y;
  
  // 计算六边形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    hexagon.x,
    hexagon.y,
    mouseX,
    mouseY
  );
  
  // 如果距离大于1像素，则移动（避免抖动）
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      hexagon.x,
      hexagon.y,
      mouseX,
      mouseY
    );
    
    // 速度为360像素/秒，转换为当前帧的移动距离
    const speed = 360;
    const moveDistance = (speed * delta) / 1000;
    
    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      hexagon.x = mouseX;
      hexagon.y = mouseY;
    } else {
      // 根据角度和移动距离计算新位置
      hexagon.x += Math.cos(angle) * moveDistance;
      hexagon.y += Math.sin(angle) * moveDistance;
    }
  }
  
  // 让六边形轻微旋转，增加视觉效果
  hexagon.rotation += 0.01;
}

new Phaser.Game(config);