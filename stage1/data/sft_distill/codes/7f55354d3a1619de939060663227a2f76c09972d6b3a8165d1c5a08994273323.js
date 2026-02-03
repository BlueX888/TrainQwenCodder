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

// 全局信号对象
window.__signals__ = {
  objects: [],
  dragCount: 0,
  sortCount: 0,
  lastDraggedIndex: -1,
  currentOrder: []
};

function preload() {
  // 创建橙色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('orangeCircle', 50, 50);
  graphics.destroy();
}

function create() {
  const objectCount = 12;
  const objects = [];
  const startX = 100;
  const startY = 50;
  const spacing = 45;

  // 添加标题文本
  this.add.text(400, 20, '拖拽橙色圆形，松手后自动按Y坐标排序', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 添加状态显示文本
  const statusText = this.add.text(400, 580, '', {
    fontSize: '14px',
    color: '#00ff00'
  }).setOrigin(0.5);

  // 创建12个橙色圆形物体
  for (let i = 0; i < objectCount; i++) {
    const x = startX;
    const y = startY + i * spacing;
    
    const circle = this.add.image(x, y, 'orangeCircle');
    circle.setInteractive({ draggable: true });
    circle.setData('index', i);
    circle.setData('originalY', y);
    
    // 添加编号文本
    const label = this.add.text(x, y, (i + 1).toString(), {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    objects.push({ circle, label, currentY: y });
    
    // 初始化signals
    window.__signals__.objects.push({
      id: i,
      x: x,
      y: y,
      dragging: false
    });
  }

  // 更新当前顺序
  updateCurrentOrder(objects);

  // 拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    const index = gameObject.getData('index');
    gameObject.setTint(0xffcc00); // 高亮显示
    
    window.__signals__.objects[index].dragging = true;
    window.__signals__.lastDraggedIndex = index;
    
    console.log(JSON.stringify({
      event: 'dragstart',
      objectId: index,
      timestamp: Date.now()
    }));
  });

  // 拖拽中事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    const index = gameObject.getData('index');
    gameObject.x = dragX;
    gameObject.y = dragY;
    
    // 同步文本位置
    objects[index].label.x = dragX;
    objects[index].label.y = dragY;
    
    // 更新signals
    window.__signals__.objects[index].x = dragX;
    window.__signals__.objects[index].y = dragY;
    window.__signals__.dragCount++;
  });

  // 拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    const index = gameObject.getData('index');
    gameObject.clearTint();
    
    window.__signals__.objects[index].dragging = false;
    
    // 更新当前Y坐标
    objects[index].currentY = gameObject.y;
    
    console.log(JSON.stringify({
      event: 'dragend',
      objectId: index,
      newY: gameObject.y,
      timestamp: Date.now()
    }));
    
    // 按Y坐标排序
    sortObjectsByY.call(this, objects, statusText);
  });

  // 初始状态显示
  updateStatusText(statusText);
}

function sortObjectsByY(objects, statusText) {
  // 创建排序数组
  const sorted = objects.map((obj, idx) => ({
    index: idx,
    y: obj.currentY,
    circle: obj.circle,
    label: obj.label
  })).sort((a, b) => a.y - b.y);

  // 计算新位置
  const startX = 100;
  const startY = 50;
  const spacing = 45;

  // 动画移动到新位置
  sorted.forEach((item, newIndex) => {
    const targetY = startY + newIndex * spacing;
    
    this.tweens.add({
      targets: item.circle,
      x: startX,
      y: targetY,
      duration: 300,
      ease: 'Power2'
    });

    this.tweens.add({
      targets: item.label,
      x: startX,
      y: targetY,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // 更新存储的Y坐标
        objects[item.index].currentY = targetY;
      }
    });

    // 更新signals
    window.__signals__.objects[item.index].x = startX;
    window.__signals__.objects[item.index].y = targetY;
  });

  // 增加排序计数
  window.__signals__.sortCount++;
  
  // 更新当前顺序
  updateCurrentOrder(objects);
  
  // 更新状态文本
  updateStatusText(statusText);
  
  console.log(JSON.stringify({
    event: 'sort',
    sortCount: window.__signals__.sortCount,
    newOrder: window.__signals__.currentOrder,
    timestamp: Date.now()
  }));
}

function updateCurrentOrder(objects) {
  // 按当前Y坐标排序获取顺序
  const sorted = objects.map((obj, idx) => ({
    index: idx,
    y: obj.currentY
  })).sort((a, b) => a.y - b.y);
  
  window.__signals__.currentOrder = sorted.map(item => item.index + 1);
}

function updateStatusText(statusText) {
  const text = `拖拽次数: ${window.__signals__.dragCount} | 排序次数: ${window.__signals__.sortCount} | 当前顺序: [${window.__signals__.currentOrder.join(', ')}]`;
  statusText.setText(text);
}

new Phaser.Game(config);