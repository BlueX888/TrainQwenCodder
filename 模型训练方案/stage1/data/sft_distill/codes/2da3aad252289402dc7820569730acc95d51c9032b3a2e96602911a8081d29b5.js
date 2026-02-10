const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  objects: [],
  dragCount: 0,
  sortCount: 0,
  currentOrder: []
};

let objects = [];
let isDragging = false;

function preload() {
  // 使用Graphics创建白色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 120, 80);
  graphics.generateTexture('whiteBox', 120, 80);
  graphics.destroy();
}

function create() {
  // 创建标题文本
  this.add.text(400, 30, '拖拽白色物体，松手后自动按Y坐标排序', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 60, '拖拽次数和排序次数会显示在控制台', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);

  // 创建3个白色物体，初始位置随机
  const initialPositions = [
    { x: 200, y: 200, id: 1 },
    { x: 400, y: 350, id: 2 },
    { x: 600, y: 250, id: 3 }
  ];

  initialPositions.forEach((pos) => {
    const obj = this.add.sprite(pos.x, pos.y, 'whiteBox');
    obj.setInteractive({ draggable: true });
    obj.setData('id', pos.id);
    obj.setData('originalY', pos.y);
    
    // 添加ID文本
    const text = this.add.text(0, 0, `物体 ${pos.id}`, {
      fontSize: '18px',
      color: '#000000'
    }).setOrigin(0.5);
    
    obj.setData('text', text);
    objects.push(obj);
    
    // 添加边框效果
    const border = this.add.graphics();
    border.lineStyle(2, 0x666666, 1);
    border.strokeRect(-60, -40, 120, 80);
    obj.setData('border', border);
  });

  // 初始化signals
  updateSignals();

  // 拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    isDragging = true;
    gameObject.setTint(0xcccccc);
    gameObject.setScale(1.1);
    
    window.__signals__.dragCount++;
    console.log(JSON.stringify({
      event: 'dragstart',
      objectId: gameObject.getData('id'),
      dragCount: window.__signals__.dragCount
    }));
  });

  // 拖拽中事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
    
    // 更新文本和边框位置
    const text = gameObject.getData('text');
    const border = gameObject.getData('border');
    text.setPosition(dragX, dragY);
    border.setPosition(dragX, dragY);
  });

  // 拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    isDragging = false;
    gameObject.clearTint();
    gameObject.setScale(1);
    
    console.log(JSON.stringify({
      event: 'dragend',
      objectId: gameObject.getData('id'),
      finalY: gameObject.y
    }));
    
    // 按Y坐标排序
    sortObjectsByY(this);
  });
}

function sortObjectsByY(scene) {
  // 按Y坐标从小到大排序
  const sortedObjects = [...objects].sort((a, b) => a.y - b.y);
  
  window.__signals__.sortCount++;
  
  // 计算排列位置（垂直居中排列，间距150）
  const startY = 150;
  const spacing = 150;
  
  sortedObjects.forEach((obj, index) => {
    const targetY = startY + index * spacing;
    const targetX = 400; // 水平居中
    
    // 使用Tween动画平滑移动
    scene.tweens.add({
      targets: obj,
      x: targetX,
      y: targetY,
      duration: 500,
      ease: 'Power2',
      onUpdate: () => {
        // 同步更新文本和边框位置
        const text = obj.getData('text');
        const border = obj.getData('border');
        text.setPosition(obj.x, obj.y);
        border.setPosition(obj.x, obj.y);
      }
    });
  });
  
  // 更新signals
  updateSignals();
  
  console.log(JSON.stringify({
    event: 'sorted',
    sortCount: window.__signals__.sortCount,
    order: sortedObjects.map(obj => ({
      id: obj.getData('id'),
      y: Math.round(obj.y)
    }))
  }));
}

function updateSignals() {
  window.__signals__.objects = objects.map(obj => ({
    id: obj.getData('id'),
    x: Math.round(obj.x),
    y: Math.round(obj.y)
  }));
  
  // 按Y坐标排序后的顺序
  const sorted = [...objects].sort((a, b) => a.y - b.y);
  window.__signals__.currentOrder = sorted.map(obj => obj.getData('id'));
}

function update() {
  // 实时更新文本和边框位置（非拖拽时）
  if (!isDragging) {
    objects.forEach(obj => {
      const text = obj.getData('text');
      const border = obj.getData('border');
      text.setPosition(obj.x, obj.y);
      border.setPosition(obj.x, obj.y);
    });
  }
  
  // 更新signals
  updateSignals();
}

new Phaser.Game(config);