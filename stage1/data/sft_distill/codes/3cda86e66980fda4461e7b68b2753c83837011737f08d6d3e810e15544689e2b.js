class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.objects = [];
    this.dragCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建12个橙色圆形物体
    const colors = [0xff6600, 0xff8800, 0xffaa00];
    const startX = 150;
    const spacing = 50;

    for (let i = 0; i < 12; i++) {
      // 创建圆形纹理
      const graphics = this.add.graphics();
      const color = colors[i % colors.length];
      graphics.fillStyle(color, 1);
      graphics.fillCircle(25, 25, 25);
      graphics.lineStyle(3, 0xffffff, 1);
      graphics.strokeCircle(25, 25, 25);
      
      // 添加编号文字
      const text = this.add.text(25, 25, (i + 1).toString(), {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      
      // 生成纹理
      const key = `circle_${i}`;
      graphics.generateTexture(key, 50, 50);
      graphics.destroy();

      // 创建可交互的精灵
      const randomX = Phaser.Math.Between(100, 700);
      const randomY = Phaser.Math.Between(100, 500);
      const sprite = this.add.sprite(randomX, randomY, key);
      
      // 添加编号文字到精灵上
      const label = this.add.text(sprite.x, sprite.y, (i + 1).toString(), {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);
      
      // 存储关联信息
      sprite.setData('index', i);
      sprite.setData('label', label);
      sprite.setData('originalDepth', sprite.depth);

      // 启用交互和拖拽
      sprite.setInteractive({ draggable: true, cursor: 'pointer' });
      
      this.objects.push(sprite);
    }

    // 添加说明文字
    this.add.text(400, 30, '拖拽橙色圆形，松手后自动按Y坐标排序', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 570, '拖拽次数: 0', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ecf0f1'
    }).setOrigin(0.5).setName('dragCountText');

    // 设置拖拽事件监听
    this.input.on('dragstart', (pointer, gameObject) => {
      // 提升被拖拽物体的层级
      gameObject.setDepth(1000);
      const label = gameObject.getData('label');
      if (label) {
        label.setDepth(1001);
      }
      
      // 添加视觉反馈
      gameObject.setScale(1.2);
      gameObject.setAlpha(0.8);
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      // 实时更新位置
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      const label = gameObject.getData('label');
      if (label) {
        label.x = dragX;
        label.y = dragY;
      }
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复原始状态
      gameObject.setScale(1);
      gameObject.setAlpha(1);
      gameObject.setDepth(gameObject.getData('originalDepth'));
      
      const label = gameObject.getData('label');
      if (label) {
        label.setDepth(gameObject.depth + 1);
      }

      // 增加拖拽计数
      this.dragCount++;
      const dragCountText = this.children.getByName('dragCountText');
      if (dragCountText) {
        dragCountText.setText(`拖拽次数: ${this.dragCount}`);
      }

      // 执行排序
      this.sortAndArrange();
    });

    // 初始化验证信号
    this.updateSignals();
  }

  sortAndArrange() {
    // 按Y坐标排序所有物体
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);

    // 计算排列位置
    const startY = 100;
    const spacing = 40;
    const centerX = 400;

    // 使用补间动画移动到新位置
    sorted.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      
      this.tweens.add({
        targets: obj,
        x: centerX,
        y: targetY,
        duration: 300,
        ease: 'Power2',
        onUpdate: () => {
          // 同步更新文字标签位置
          const label = obj.getData('label');
          if (label) {
            label.x = obj.x;
            label.y = obj.y;
          }
        }
      });

      // 同时移动标签
      const label = obj.getData('label');
      if (label) {
        this.tweens.add({
          targets: label,
          x: centerX,
          y: targetY,
          duration: 300,
          ease: 'Power2'
        });
      }
    });

    // 更新验证信号
    this.time.delayedCall(350, () => {
      this.updateSignals();
    });
  }

  updateSignals() {
    // 获取当前排序状态
    const currentOrder = this.objects
      .map(obj => ({
        index: obj.getData('index') + 1,
        x: Math.round(obj.x),
        y: Math.round(obj.y)
      }))
      .sort((a, b) => a.y - b.y);

    // 输出验证信号
    window.__signals__ = {
      dragCount: this.dragCount,
      objectCount: this.objects.length,
      currentOrder: currentOrder,
      isSorted: this.checkIfSorted(),
      timestamp: Date.now()
    };

    // 同时输出到控制台
    console.log('Drag Sort Signals:', JSON.stringify(window.__signals__, null, 2));
  }

  checkIfSorted() {
    // 检查是否已按Y坐标排序
    for (let i = 0; i < this.objects.length - 1; i++) {
      if (this.objects[i].y > this.objects[i + 1].y) {
        return false;
      }
    }
    return true;
  }

  update(time, delta) {
    // 每帧更新（如需要）
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: DragSortScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 初始化全局信号对象
window.__signals__ = {
  dragCount: 0,
  objectCount: 12,
  currentOrder: [],
  isSorted: false,
  timestamp: Date.now()
};