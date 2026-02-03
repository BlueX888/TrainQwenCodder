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

// 全局信号对象，用于验证状态
window.__signals__ = {
  objects: [],
  sortCount: 0,
  lastSortOrder: []
};

function preload() {
  // 创建粉色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRoundedRect(0, 0, 120, 80, 10);
  graphics.lineStyle(3, 0xff1493, 1); // 深粉色边框
  graphics.strokeRoundedRect(0, 0, 120, 80, 10);
  graphics.generateTexture('pinkBox', 120, 80);
  graphics.destroy();
}

function create() {
  const scene = this;
  
  // 添加标题文本
  this.add.text(400, 50, '拖拽粉色物体进行排序', {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 90, '松手后会按Y坐标自动排列', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  }).setOrigin(0.5);

  // 创建3个可拖拽的粉色物体
  const objects = [];
  const initialPositions = [
    { x: 200, y: 250, id: 'A' },
    { x: 400, y: 350, id: 'B' },
    { x: 600, y: 450, id: 'C' }
  ];

  initialPositions.forEach((pos, index) => {
    // 创建精灵
    const sprite = this.add.sprite(pos.x, pos.y, 'pinkBox');
    sprite.setInteractive({ draggable: true });
    sprite.setData('id', pos.id);
    sprite.setData('originalIndex', index);
    
    // 添加文本标签
    const label = this.add.text(pos.x, pos.y, pos.id, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    sprite.setData('label', label);
    objects.push(sprite);
  });

  // 拖拽开始事件
  this.input.on('dragstart', function(pointer, gameObject) {
    gameObject.setTint(0xffaacc); // 拖拽时变浅粉色
    gameObject.setScale(1.1); // 稍微放大
    gameObject.setDepth(100); // 置于最上层
    
    const label = gameObject.getData('label');
    label.setDepth(101);
  });

  // 拖拽中事件
  this.input.on('drag', function(pointer, gameObject, dragX, dragY) {
    gameObject.x = dragX;
    gameObject.y = dragY;
    
    // 标签跟随
    const label = gameObject.getData('label');
    label.x = dragX;
    label.y = dragY;
  });

  // 拖拽结束事件
  this.input.on('dragend', function(pointer, gameObject) {
    gameObject.clearTint();
    gameObject.setScale(1);
    gameObject.setDepth(0);
    
    const label = gameObject.getData('label');
    label.setDepth(1);
    
    // 按Y坐标排序所有物体
    sortAndArrangeObjects(scene, objects);
  });

  // 初始化信号
  updateSignals(objects);
}

// 排序并重新排列物体
function sortAndArrangeObjects(scene, objects) {
  // 按Y坐标排序（从小到大）
  const sorted = [...objects].sort((a, b) => a.y - b.y);
  
  // 计算新的Y位置（均匀分布）
  const startY = 250;
  const spacing = 100;
  const targetX = 400; // 统一X坐标
  
  // 使用 Tween 动画移动到新位置
  sorted.forEach((obj, index) => {
    const targetY = startY + index * spacing;
    
    scene.tweens.add({
      targets: obj,
      x: targetX,
      y: targetY,
      duration: 400,
      ease: 'Back.easeOut'
    });
    
    // 标签也跟随移动
    const label = obj.getData('label');
    scene.tweens.add({
      targets: label,
      x: targetX,
      y: targetY,
      duration: 400,
      ease: 'Back.easeOut'
    });
  });
  
  // 更新信号
  window.__signals__.sortCount++;
  updateSignals(sorted);
  
  // 输出排序日志
  console.log(JSON.stringify({
    event: 'sort_complete',
    sortCount: window.__signals__.sortCount,
    order: window.__signals__.lastSortOrder
  }));
}

// 更新验证信号
function updateSignals(objects) {
  window.__signals__.objects = objects.map(obj => ({
    id: obj.getData('id'),
    x: Math.round(obj.x),
    y: Math.round(obj.y)
  }));
  
  window.__signals__.lastSortOrder = objects.map(obj => obj.getData('id'));
}

new Phaser.Game(config);