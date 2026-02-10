const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let hexagon;
let pointer;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色六边形
  const graphics = this.add.graphics();
  
  // 绘制六边形
  const hexRadius = 30;
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.beginPath();
  
  for (let i = 0; i < sides; i++) {
    const x = hexRadius * Math.cos(angle * i);
    const y = hexRadius * Math.sin(angle * i);
    
    if (i === 0) {
      graphics.moveTo(x + hexRadius, y + hexRadius);
    } else {
      graphics.lineTo(x + hexRadius, y + hexRadius);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建六边形精灵
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 获取指针引用
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse to see the hexagon follow!', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算六边形到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    hexagon.x,
    hexagon.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素，则移动六边形
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      hexagon.x,
      hexagon.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度80和delta时间计算移动距离
    const speed = 80;
    const moveDistance = Math.min(speed * (delta / 1000), distance);
    
    // 计算新位置
    hexagon.x += Math.cos(angle) * moveDistance;
    hexagon.y += Math.sin(angle) * moveDistance;
  }
}

new Phaser.Game(config);