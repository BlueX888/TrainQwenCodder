class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 状态信号：记录排序次数
    this.objects = [];
    this.isSorting = false; // 防止排序过程中再次拖拽
  }

  preload() {
    // 使用Graphics创建黄色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFD700, 1); // 金黄色
    graphics.fillRoundedRect(0, 0, 80, 60, 8);
    graphics.lineStyle(3, 0xFFA500, 1); // 橙色边框
    graphics.strokeRoundedRect(0, 0, 80, 60, 8);
    graphics.generateTexture('yellowBox', 80, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题
    this.add.text(400, 30, '拖拽黄色物体，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加排序计数显示
    this.sortText = this.add.text(400, 60, `排序次数: ${this.sortCount}`, {
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建10个黄色物体，初始位置随机
    const startX = 150;
    const spacing = 100;
    
    for (let i = 0; i < 10; i++) {
      const x = startX + (i % 5) * spacing;
      const y = 150 + Math.floor(i / 5) * 200 + Math.random() * 100;
      
      const obj = this.add.sprite(x, y, 'yellowBox');
      
      // 添加编号文本
      const label = this.add.text(x, y, `#${i + 1}`, {
        fontSize: '18px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 将文本作为物体的子对象
      obj.label = label;
      obj.index = i;
      
      // 启用交互和拖拽
      obj.setInteractive({ draggable: true, cursor: 'pointer' });
      
      this.objects.push(obj);
    }

    // 监听拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      if (this.isSorting) return;
      
      // 提升层级
      this.children.bringToTop(gameObject);
      this.children.bringToTop(gameObject.label);
      
      // 放大效果
      this.tweens.add({
        targets: [gameObject, gameObject.label],
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
        ease: 'Power2'
      });
    });

    // 监听拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (this.isSorting) return;
      
      gameObject.x = dragX;
      gameObject.y = dragY;
      gameObject.label.x = dragX;
      gameObject.label.y = dragY;
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      if (this.isSorting) return;
      
      // 恢复大小
      this.tweens.add({
        targets: [gameObject, gameObject.label],
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Power2'
      });
      
      // 触发排序
      this.sortObjects();
    });

    // 添加说明文本
    this.add.text(400, 550, '提示：拖动任意物体后松手，所有物体将按Y坐标从上到下排列', {
      fontSize: '14px',
      color: '#cccccc'
    }).setOrigin(0.5);
  }

  sortObjects() {
    if (this.isSorting) return;
    
    this.isSorting = true;
    this.sortCount++;
    
    // 更新排序计数显示
    this.sortText.setText(`排序次数: ${this.sortCount}`);
    
    // 按Y坐标排序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);
    
    // 计算新的Y位置（等间距排列）
    const startY = 150;
    const spacing = 40;
    
    sorted.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      const targetX = 400; // 居中对齐
      
      // 禁用拖拽
      obj.disableInteractive();
      
      // 缓动动画移动到新位置
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          // 同步更新文本位置
          obj.label.x = obj.x;
          obj.label.y = obj.y;
        },
        onComplete: () => {
          // 重新启用拖拽
          obj.setInteractive({ draggable: true, cursor: 'pointer' });
          
          // 最后一个动画完成后解除锁定
          if (index === sorted.length - 1) {
            this.isSorting = false;
          }
        }
      });
      
      // 文本也需要缓动
      this.tweens.add({
        targets: obj.label,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2'
      });
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
new Phaser.Game(config);