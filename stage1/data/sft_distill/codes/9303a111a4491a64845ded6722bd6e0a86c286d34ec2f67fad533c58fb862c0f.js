const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量
let objects = [];
let cursors;
let totalDistance = 0; // 可验证的状态信号：记录总移动距离
let statusText;

function preload() {
  // 创建红色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('redBox', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建3个红色对象，横向排列
  const startX = 200;
  const startY = 300;
  const spacing = 150;
  
  for (let i = 0; i < 3; i++) {
    const obj = this.add.image(startX + i * spacing, startY, 'redBox');
    obj.setOrigin(0.5);
    objects.push(obj);
  }
  
  // 创建方向键
  cursors = this.input.keyboard.createCursorKeys();
  
  // 显示状态信息
  statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  updateStatusText();
  
  // 添加提示文本
  this.add.text(400, 550, '使用方向键控制所有红色方块移动', {
    fontSize: '16px',
    fill: '#aaaaaa'
  }).setOrigin(0.5);
}

function update(time, delta) {
  const speed = 120;
  const deltaSeconds = delta / 1000; // 转换为秒
  let moved = false;
  let dx = 0;
  let dy = 0;
  
  // 检测方向键状态
  if (cursors.left.isDown) {
    dx = -speed * deltaSeconds;
    moved = true;
  } else if (cursors.right.isDown) {
    dx = speed * deltaSeconds;
    moved = true;
  }
  
  if (cursors.up.isDown) {
    dy = -speed * deltaSeconds;
    moved = true;
  } else if (cursors.down.isDown) {
    dy = speed * deltaSeconds;
    moved = true;
  }
  
  // 同步移动所有对象
  if (moved) {
    objects.forEach(obj => {
      let newX = obj.x + dx;
      let newY = obj.y + dy;
      
      // 边界检测（考虑对象的宽高）
      const halfWidth = obj.width / 2;
      const halfHeight = obj.height / 2;
      
      newX = Phaser.Math.Clamp(newX, halfWidth, 800 - halfWidth);
      newY = Phaser.Math.Clamp(newY, halfHeight, 600 - halfHeight);
      
      obj.setPosition(newX, newY);
    });
    
    // 计算移动距离
    const distance = Math.sqrt(dx * dx + dy * dy);
    totalDistance += distance;
    
    updateStatusText();
  }
}

function updateStatusText() {
  statusText.setText([
    `对象数量: ${objects.length}`,
    `移动速度: 120`,
    `总移动距离: ${Math.floor(totalDistance)}`,
    `位置: [${objects.map(obj => `(${Math.floor(obj.x)},${Math.floor(obj.y)})`).join(', ')}]`
  ]);
}

new Phaser.Game(config);