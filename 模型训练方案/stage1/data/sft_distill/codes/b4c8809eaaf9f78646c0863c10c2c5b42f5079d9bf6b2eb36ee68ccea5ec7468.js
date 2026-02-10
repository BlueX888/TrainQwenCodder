// Phaser3 拖拽排序游戏
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
  items: [],
  dragCount: 0,
  sortCount: 0,
  events: []
};

let items = [];
const ITEM_COUNT = 10;
const ITEM_SIZE = 60;
const SORT_X = 400; // 排序后的统一 X 坐标
const START_Y = 50;
const SPACING = 50;

function preload() {
  // 使用 Graphics 创建绿色方块纹理
  const graphics = this.add.graphics();
  
  // 绘制绿色方块
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRoundedRect(0, 0, ITEM_SIZE, ITEM_SIZE, 8);
  
  // 绘制边框
  graphics.lineStyle(3, 0x00aa00, 1);
  graphics.strokeRoundedRect(0, 0, ITEM_SIZE, ITEM_SIZE, 8);
  
  // 添加编号背景
  graphics.fillStyle(0x008800, 0.5);
  graphics.fillCircle(ITEM_SIZE / 2, ITEM_SIZE / 2, 15);
  
  graphics.generateTexture('greenBox', ITEM_SIZE, ITEM_SIZE);
  graphics.destroy();
}

function create() {
  // 添加标题文本
  this.add.text(400, 20, '拖拽绿色方块，松手后自动按Y坐标排序', {
    fontSize: '20px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 添加说明文本
  this.add.text(400, 580, '拖拽次数: 0 | 排序次数: 0', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5).setName('statsText');
  
  // 创建10个可拖拽物体
  for (let i = 0; i < ITEM_COUNT; i++) {
    // 随机初始位置
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);
    
    const item = this.add.sprite(x, y, 'greenBox');
    item.setInteractive({ draggable: true, useHandCursor: true });
    item.setData('id', i);
    item.setData('originalY', y);
    
    // 添加编号文本
    const text = this.add.text(x, y, (i + 1).toString(), {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    item.setData('text', text);
    
    items.push(item);
    
    // 记录初始状态
    window.__signals__.items.push({
      id: i,
      x: x,
      y: y
    });
  }
  
  // 拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    gameObject.setTint(0xffff00); // 拖拽时变黄
    gameObject.setDepth(100); // 置于最上层
    
    window.__signals__.events.push({
      type: 'dragstart',
      id: gameObject.getData('id'),
      time: Date.now()
    });
  });
  
  // 拖拽中事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
    
    // 同步文本位置
    const text = gameObject.getData('text');
    text.x = dragX;
    text.y = dragY;
  });
  
  // 拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    gameObject.clearTint(); // 恢复颜色
    gameObject.setDepth(0);
    
    window.__signals__.dragCount++;
    
    window.__signals__.events.push({
      type: 'dragend',
      id: gameObject.getData('id'),
      x: gameObject.x,
      y: gameObject.y,
      time: Date.now()
    });
    
    // 触发排序
    sortItems.call(this);
    
    // 更新统计文本
    updateStatsText.call(this);
  });
  
  console.log('游戏初始化完成，共创建', ITEM_COUNT, '个可拖拽物体');
  console.log('初始状态:', JSON.stringify(window.__signals__.items));
}

function sortItems() {
  // 按当前 Y 坐标排序
  const sortedItems = [...items].sort((a, b) => a.y - b.y);
  
  window.__signals__.sortCount++;
  
  // 记录排序前的状态
  const beforeSort = items.map(item => ({
    id: item.getData('id'),
    y: item.y
  }));
  
  // 计算新位置并执行动画
  sortedItems.forEach((item, index) => {
    const targetY = START_Y + index * SPACING;
    const text = item.getData('text');
    
    // 使用 Tween 动画移动到新位置
    this.tweens.add({
      targets: item,
      x: SORT_X,
      y: targetY,
      duration: 500,
      ease: 'Power2'
    });
    
    // 文本同步移动
    this.tweens.add({
      targets: text,
      x: SORT_X,
      y: targetY,
      duration: 500,
      ease: 'Power2'
    });
  });
  
  // 记录排序后的状态
  const afterSort = sortedItems.map((item, index) => ({
    id: item.getData('id'),
    newIndex: index,
    targetY: START_Y + index * SPACING
  }));
  
  window.__signals__.events.push({
    type: 'sort',
    beforeSort: beforeSort,
    afterSort: afterSort,
    time: Date.now()
  });
  
  console.log('执行排序，排序次数:', window.__signals__.sortCount);
  console.log('排序结果:', JSON.stringify(afterSort));
}

function updateStatsText() {
  const statsText = this.children.getByName('statsText');
  if (statsText) {
    statsText.setText(
      `拖拽次数: ${window.__signals__.dragCount} | 排序次数: ${window.__signals__.sortCount}`
    );
  }
}

// 启动游戏
new Phaser.Game(config);