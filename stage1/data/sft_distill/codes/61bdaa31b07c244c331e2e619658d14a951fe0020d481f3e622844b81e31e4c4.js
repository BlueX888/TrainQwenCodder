const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色星形
  const graphics = this.add.graphics();
  
  // 绘制星形的函数
  const drawStar = (cx, cy, spikes, outerRadius, innerRadius) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;
    
    graphics.beginPath();
    graphics.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      graphics.lineTo(x, y);
      rot += step;
      
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      graphics.lineTo(x, y);
      rot += step;
    }
    
    graphics.lineTo(cx, cy - outerRadius);
    graphics.closePath();
  };
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制星形（中心在50,50，外半径40，内半径20，5个尖角）
  drawStar(50, 50, 5, 40, 20);
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵
  this.star = this.add.sprite(400, 300, 'star');
  
  // 存储跟随速度
  this.followSpeed = 360;
  
  // 显示提示文本
  this.add.text(10, 10, 'Move your mouse - the star will follow!', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  
  // 计算星形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    this.star.x,
    this.star.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素，则移动星形
  if (distance > 1) {
    // 计算从星形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      this.star.x,
      this.star.y,
      pointer.x,
      pointer.y
    );
    
    // 计算本帧应该移动的距离（速度 * 时间）
    // delta 是毫秒，转换为秒
    const moveDistance = this.followSpeed * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      this.star.x = pointer.x;
      this.star.y = pointer.y;
    } else {
      // 根据角度和移动距离更新位置
      this.star.x += Math.cos(angle) * moveDistance;
      this.star.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);