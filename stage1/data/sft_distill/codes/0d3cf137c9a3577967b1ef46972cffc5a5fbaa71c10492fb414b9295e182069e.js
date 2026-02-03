class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.dragCount = 0;      // 拖拽次数（状态信号）
    this.sortCount = 0;      // 排序次数（状态信号）
    this.objects = [];       // 存储所有可拖拽物体
  }

  preload() {
    // 使用Graphics创建青色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillRect(0, 0, 80, 80);
    graphics.generateTexture('cyanBox', 80, 80);
    graphics.destroy();
  }

  create() {
    // 添加标题文本
    this.add.text(400, 30, '拖拽青色方块，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加状态显示文本
    this.statusText = this.add.text(400, 60, '', {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建5个青色物体，初始随机Y坐标
    const startX = 400;
    const yPositions = [150, 250, 350, 450, 550];
    
    // 打乱初始Y坐标
    Phaser.Utils.Array.Shuffle(yPositions);

    for (let i = 0; i < 5; i++) {
      const box = this.add.sprite(startX, yPositions[i], 'cyanBox');
      box.setInteractive({ draggable: true });
      
      // 添加边框效果
      const border = this.add.graphics();
      border.lineStyle(3, 0xFFFFFF, 0.5);
      border.strokeRect(-40, -40, 80, 80);
      box.border = border;
      border.setPosition(box.x, box.y);
      
      // 添加序号文本
      const text = this.add.text(0, 0, `#${i + 1}`, {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      box.label = text;
      text.setPosition(box.x, box.y);
      
      this.objects.push(box);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 更新边框和文本位置
      if (gameObject.border) {
        gameObject.border.setPosition(dragX, dragY);
      }
      if (gameObject.label) {
        gameObject.label.setPosition(dragX, dragY);
      }
      
      // 拖拽时放大效果
      gameObject.setScale(1.1);
      gameObject.setDepth(100);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      this.dragCount++;
      this.updateStatus();
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复大小
      gameObject.setScale(1);
      gameObject.setDepth(0);
      
      // 执行排序
      this.sortObjects();
    });

    // 初始状态显示
    this.updateStatus();
  }

  sortObjects() {
    this.sortCount++;
    this.updateStatus();

    // 收集所有物体的Y坐标并排序
    const sortedObjects = [...this.objects].sort((a, b) => a.y - b.y);
    
    // 计算排序后的目标Y坐标（均匀分布）
    const startY = 150;
    const spacing = 100;
    const targetX = 400;

    // 为每个物体创建移动动画
    sortedObjects.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      
      // 使用Tween动画移动到目标位置
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          // 同步更新边框和文本位置
          if (obj.border) {
            obj.border.setPosition(obj.x, obj.y);
          }
          if (obj.label) {
            obj.label.setPosition(obj.x, obj.y);
          }
        }
      });
    });

    // 显示排序完成提示
    const sortText = this.add.text(400, 500, '排序完成！', {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 1秒后移除提示
    this.time.delayedCall(1000, () => {
      sortText.destroy();
    });
  }

  updateStatus() {
    this.statusText.setText(
      `拖拽次数: ${this.dragCount} | 排序次数: ${this.sortCount}`
    );
  }

  update(time, delta) {
    // 可选：添加鼠标悬停效果
    this.objects.forEach(obj => {
      if (!this.input.getDragState(obj)) {
        // 检查鼠标是否悬停
        const pointer = this.input.activePointer;
        const bounds = obj.getBounds();
        
        if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
          obj.setTint(0xaaffff); // 浅青色高亮
        } else {
          obj.clearTint();
        }
      }
    });
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);